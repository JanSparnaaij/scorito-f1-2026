import { FastifyInstance } from 'fastify';
import prisma from 'db/client';
import { calculatePoints } from 'core';

// OpenF1 API base URL
const OPENF1_BASE = 'https://api.openf1.org/v1';

export default async function routes(fastify: FastifyInstance) {
  // ── Health ──────────────────────────────────────────────
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // ── Drivers ─────────────────────────────────────────────
  fastify.get('/drivers', async () => {
    const drivers = await prisma.driver.findMany({
      include: {
        team: true,
        prices: {
          where: { source: 'scorito-f1-2026' },
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
        raceResults: {
          include: { race: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return drivers.map((d) => ({
      ...d,
      totalPoints: d.raceResults.reduce((sum, r) => sum + r.points, 0),
    }));
  });

  fastify.get('/drivers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        team: true,
        prices: {
          where: { source: 'scorito-f1-2026' },
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
        raceResults: {
          include: { race: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!driver) {
      reply.code(404);
      return { error: 'Driver not found' };
    }
    return {
      ...driver,
      totalPoints: driver.raceResults.reduce((sum, r) => sum + r.points, 0),
    };
  });

  // ── Constructors ─────────────────────────────────────────
  fastify.get('/constructors', async () => {
    const constructors = await prisma.constructor.findMany({
      include: {
        drivers: {
          include: {
            raceResults: true,
          },
        },
        prices: {
          where: { source: 'scorito-f1-2026' },
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    return constructors.map((c) => ({
      ...c,
      totalPoints: c.drivers.reduce(
        (sum, d) => sum + d.raceResults.reduce((s, r) => s + r.points, 0),
        0
      ),
    }));
  });

  // ── Races ────────────────────────────────────────────────
  fastify.get('/races', async () => {
    return prisma.race.findMany({
      orderBy: { scheduledAt: 'asc' },
    });
  });

  fastify.get('/races/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const race = await prisma.race.findUnique({
      where: { slug },
      include: {
        raceResults: {
          include: { driver: { include: { team: true } } },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!race) {
      reply.code(404);
      return { error: 'Race not found' };
    }
    return race;
  });

  // ── Prices ───────────────────────────────────────────────
  fastify.get('/prices', async () => {
    return prisma.price.findMany({
      include: {
        driver: true,
        constructor: true,
      },
      orderBy: { amountEUR: 'desc' },
    });
  });

  fastify.post('/prices/seed', async (request) => {
    const body = request.body as {
      prices: Array<{
        driverId?: string;
        constructorId?: string;
        source: string;
        amountEUR: number;
      }>;
    };

    let created = 0;
    let updated = 0;

    for (const entry of body.prices) {
      const existing = await prisma.price.findFirst({
        where: {
          driverId: entry.driverId ?? null,
          constructorId: entry.constructorId ?? null,
          source: entry.source,
        },
      });

      if (existing) {
        await prisma.price.update({
          where: { id: existing.id },
          data: { amountEUR: entry.amountEUR, capturedAt: new Date() },
        });
        updated++;
      } else {
        await prisma.price.create({ data: entry });
        created++;
      }
    }

    return { message: 'Prices seeded', created, updated };
  });

  // ── Sync from OpenF1 ────────────────────────────────────
  fastify.post('/drivers/sync', async () => {
    try {
      const resp = await fetch(
        `${OPENF1_BASE}/drivers?session_key=latest`
      );

      if (!resp.ok) {
        return { error: `OpenF1 returned ${resp.status}` };
      }

      const openf1Drivers: Array<{
        driver_number: number;
        broadcast_name: string;
        full_name: string;
        name_acronym: string;
        team_name: string;
        team_colour: string;
        country_code: string;
        headshot_url: string;
      }> = await resp.json();

      let upserted = 0;

      for (const od of openf1Drivers) {
        // Upsert constructor
        const constructor = await prisma.constructor.upsert({
          where: { name: od.team_name } as any,
          update: { color: od.team_colour ? `#${od.team_colour}` : undefined },
          create: { name: od.team_name, color: od.team_colour ? `#${od.team_colour}` : null },
        });

        // Upsert driver
        await prisma.driver.upsert({
          where: { openf1Id: od.driver_number },
          update: {
            name: od.full_name,
            abbreviation: od.name_acronym,
            number: od.driver_number,
            teamId: constructor.id,
            nationality: od.country_code,
            headshot: od.headshot_url,
          },
          create: {
            openf1Id: od.driver_number,
            name: od.full_name,
            abbreviation: od.name_acronym,
            number: od.driver_number,
            teamId: constructor.id,
            nationality: od.country_code,
            headshot: od.headshot_url,
          },
        });
        upserted++;
      }

      return { message: `Synced ${upserted} drivers from OpenF1` };
    } catch (err) {
      fastify.log.error(err);
      return { error: 'Failed to sync from OpenF1', details: String(err) };
    }
  });

  fastify.post('/races/sync', async () => {
    try {
      const resp = await fetch(`${OPENF1_BASE}/meetings?year=2026`);
      if (!resp.ok) {
        return { error: `OpenF1 returned ${resp.status}` };
      }

      const meetings: Array<{
        meeting_key: number;
        meeting_name: string;
        meeting_official_name: string;
        circuit_short_name: string;
        country_name: string;
        date_start: string;
      }> = await resp.json();

      let upserted = 0;
      const now = new Date();

      for (const m of meetings) {
        const slug = m.meeting_name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          + '-2026';

        await prisma.race.upsert({
          where: { openf1Key: m.meeting_key },
          update: {
            name: m.meeting_official_name || m.meeting_name,
            circuit: m.circuit_short_name,
            country: m.country_name,
            scheduledAt: new Date(m.date_start),
            status: new Date(m.date_start) < now ? 'completed' : 'upcoming',
          },
          create: {
            openf1Key: m.meeting_key,
            slug,
            name: m.meeting_official_name || m.meeting_name,
            circuit: m.circuit_short_name,
            country: m.country_name,
            scheduledAt: new Date(m.date_start),
            status: new Date(m.date_start) < now ? 'completed' : 'upcoming',
          },
        });
        upserted++;
      }

      return { message: `Synced ${upserted} races from OpenF1` };
    } catch (err) {
      fastify.log.error(err);
      return { error: 'Failed to sync races from OpenF1', details: String(err) };
    }
  });

  fastify.post('/results/sync/:raceSlug', async (request, reply) => {
    const { raceSlug } = request.params as { raceSlug: string };

    const race = await prisma.race.findUnique({ where: { slug: raceSlug } });
    if (!race || !race.openf1Key) {
      reply.code(404);
      return { error: 'Race not found or missing openf1Key' };
    }

    try {
      // Get race session key for this meeting
      const sessResp = await fetch(
        `${OPENF1_BASE}/sessions?meeting_key=${race.openf1Key}&session_name=Race`
      );
      const sessions: Array<{ session_key: number; session_name: string }> =
        await sessResp.json();

      if (!sessions.length) {
        return { error: 'No race session found for this meeting' };
      }

      const sessionKey = sessions[0].session_key;

      // Get final positions
      const posResp = await fetch(
        `${OPENF1_BASE}/position?session_key=${sessionKey}`
      );
      const positions: Array<{
        driver_number: number;
        position: number;
        date: string;
      }> = await posResp.json();

      // Take the last known position for each driver (final result)
      const finalPositions = new Map<number, number>();
      for (const p of positions) {
        finalPositions.set(p.driver_number, p.position);
      }

      // Get lap data for fastest lap
      const lapsResp = await fetch(
        `${OPENF1_BASE}/laps?session_key=${sessionKey}`
      );
      const laps: Array<{
        driver_number: number;
        is_pit_out_lap: boolean;
        duration_sector_1: number | null;
        lap_duration: number | null;
      }> = await lapsResp.json();

      let fastestLapDriver: number | null = null;
      let fastestLapTime = Infinity;
      for (const lap of laps) {
        if (lap.lap_duration && lap.lap_duration < fastestLapTime) {
          fastestLapTime = lap.lap_duration;
          fastestLapDriver = lap.driver_number;
        }
      }

      let synced = 0;
      for (const [driverNumber, position] of finalPositions) {
        const driver = await prisma.driver.findUnique({
          where: { openf1Id: driverNumber },
        });
        if (!driver) continue;

        const isFastestLap = fastestLapDriver === driverNumber;
        const points = calculatePoints({
          position,
          dnf: false,
          fastestLap: isFastestLap,
          driverOfDay: false,
        });

        await prisma.raceResult.upsert({
          where: { raceId_driverId: { raceId: race.id, driverId: driver.id } },
          update: { position, points, fastestLap: isFastestLap },
          create: {
            raceId: race.id,
            driverId: driver.id,
            position,
            points,
            fastestLap: isFastestLap,
            driverOfDay: false,
            dnf: false,
          },
        });
        synced++;
      }

      // Mark race as completed
      await prisma.race.update({
        where: { id: race.id },
        data: { status: 'completed' },
      });

      return { message: `Synced results for ${synced} drivers` };
    } catch (err) {
      fastify.log.error(err);
      return { error: 'Failed to sync results', details: String(err) };
    }
  });
}
