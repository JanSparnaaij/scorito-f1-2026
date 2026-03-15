import { z } from 'zod';

export const ConstructorSchema = z.object({
  id: z.string(),
  openf1Id: z.number().optional(),
  name: z.string(),
  shortName: z.string().optional(),
  color: z.string().optional(),
});
export type Constructor = z.infer<typeof ConstructorSchema>;

export const DriverSchema = z.object({
  id: z.string(),
  openf1Id: z.number().optional(),
  name: z.string(),
  abbreviation: z.string().optional(),
  number: z.number().optional(),
  teamId: z.string().optional(),
  nationality: z.string().optional(),
  headshot: z.string().optional(),
  team: ConstructorSchema.optional(),
});
export type Driver = z.infer<typeof DriverSchema>;

export const RaceSchema = z.object({
  id: z.string(),
  openf1Key: z.number().optional(),
  slug: z.string(),
  name: z.string(),
  circuit: z.string().optional(),
  country: z.string().optional(),
  scheduledAt: z.date(),
  status: z.enum(['upcoming', 'completed']),
});
export type Race = z.infer<typeof RaceSchema>;

export const RaceResultSchema = z.object({
  id: z.string(),
  raceId: z.string(),
  driverId: z.string(),
  position: z.number().optional(),
  dnf: z.boolean(),
  dnfReason: z.string().optional(),
  gridPosition: z.number().optional(),
  points: z.number(),
  fastestLap: z.boolean(),
  driverOfDay: z.boolean(),
  driver: DriverSchema.optional(),
  race: RaceSchema.optional(),
});
export type RaceResult = z.infer<typeof RaceResultSchema>;

export const PriceSchema = z.object({
  id: z.string(),
  driverId: z.string().optional(),
  constructorId: z.string().optional(),
  source: z.string(),
  amountEUR: z.number(),
  capturedAt: z.date(),
});
export type Price = z.infer<typeof PriceSchema>;

/** Scorito F1 2026 scoring configuration */
export const SCORING_CONFIG = {
  /** Points awarded by race finishing position */
  racePoints: {
    1: 25,
    2: 18,
    3: 15,
    4: 12,
    5: 10,
    6: 8,
    7: 6,
    8: 4,
    9: 2,
    10: 1,
  } as Record<number, number>,
  /** Bonus points for pole position */
  poleBonus: 5,
  /** Bonus points for fastest lap (only if finishing in top 10) */
  fastestLapBonus: 5,
  /** Bonus points for driver of the day */
  driverOfDayBonus: 3,
  /** Points deducted for DNF */
  dnfPenalty: -5,
  /** Sprint race finishing points (half of race points) */
  sprintPoints: {
    1: 8,
    2: 7,
    3: 6,
    4: 5,
    5: 4,
    6: 3,
    7: 2,
    8: 1,
  } as Record<number, number>,
} as const;

/** Calculate Scorito points for a race result */
export function calculatePoints(result: {
  position?: number | null;
  dnf: boolean;
  fastestLap: boolean;
  driverOfDay: boolean;
  gridPosition?: number | null;
}): number {
  if (result.dnf) return SCORING_CONFIG.dnfPenalty;

  const pos = result.position;
  let pts = 0;

  if (pos != null) {
    pts += SCORING_CONFIG.racePoints[pos] ?? 0;
  }

  if (result.fastestLap && pos != null && pos <= 10) {
    pts += SCORING_CONFIG.fastestLapBonus;
  }

  if (result.driverOfDay) {
    pts += SCORING_CONFIG.driverOfDayBonus;
  }

  if (result.gridPosition === 1) {
    pts += SCORING_CONFIG.poleBonus;
  }

  return pts;
}

/** Team builder constraints */
export const TEAM_CONFIG = {
  budget: 100_000_000,
  maxDrivers: 5,
  maxConstructors: 1,
  maxDriversPerTeam: 2,
} as const;
