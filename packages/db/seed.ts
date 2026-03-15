import prisma from './client';

const constructors = [
  { name: 'Red Bull Racing', shortName: 'Red Bull', color: '#3671C6' },
  { name: 'Ferrari', shortName: 'Ferrari', color: '#E8002D' },
  { name: 'Mercedes', shortName: 'Mercedes', color: '#27F4D2' },
  { name: 'McLaren', shortName: 'McLaren', color: '#FF8000' },
  { name: 'Aston Martin', shortName: 'Aston Martin', color: '#229971' },
  { name: 'Alpine', shortName: 'Alpine', color: '#0093CC' },
  { name: 'Williams', shortName: 'Williams', color: '#64C4FF' },
  { name: 'Haas', shortName: 'Haas', color: '#B6BABD' },
  { name: 'Kick Sauber', shortName: 'Sauber', color: '#52E252' },
  { name: 'Racing Bulls', shortName: 'Racing Bulls', color: '#6692FF' },
];

const drivers = [
  // Red Bull Racing
  { name: 'Max Verstappen', abbreviation: 'VER', number: 1, teamName: 'Red Bull Racing', nationality: 'NL' },
  { name: 'Liam Lawson', abbreviation: 'LAW', number: 30, teamName: 'Red Bull Racing', nationality: 'NZ' },
  // Ferrari
  { name: 'Charles Leclerc', abbreviation: 'LEC', number: 16, teamName: 'Ferrari', nationality: 'MC' },
  { name: 'Lewis Hamilton', abbreviation: 'HAM', number: 44, teamName: 'Ferrari', nationality: 'GB' },
  // Mercedes
  { name: 'George Russell', abbreviation: 'RUS', number: 63, teamName: 'Mercedes', nationality: 'GB' },
  { name: 'Andrea Kimi Antonelli', abbreviation: 'ANT', number: 12, teamName: 'Mercedes', nationality: 'IT' },
  // McLaren
  { name: 'Lando Norris', abbreviation: 'NOR', number: 4, teamName: 'McLaren', nationality: 'GB' },
  { name: 'Oscar Piastri', abbreviation: 'PIA', number: 81, teamName: 'McLaren', nationality: 'AU' },
  // Aston Martin
  { name: 'Fernando Alonso', abbreviation: 'ALO', number: 14, teamName: 'Aston Martin', nationality: 'ES' },
  { name: 'Lance Stroll', abbreviation: 'STR', number: 18, teamName: 'Aston Martin', nationality: 'CA' },
  // Alpine
  { name: 'Pierre Gasly', abbreviation: 'GAS', number: 10, teamName: 'Alpine', nationality: 'FR' },
  { name: 'Jack Doohan', abbreviation: 'DOO', number: 7, teamName: 'Alpine', nationality: 'AU' },
  // Williams
  { name: 'Carlos Sainz', abbreviation: 'SAI', number: 55, teamName: 'Williams', nationality: 'ES' },
  { name: 'Alexander Albon', abbreviation: 'ALB', number: 23, teamName: 'Williams', nationality: 'TH' },
  // Haas
  { name: 'Nico Hülkenberg', abbreviation: 'HUL', number: 27, teamName: 'Haas', nationality: 'DE' },
  { name: 'Oliver Bearman', abbreviation: 'BEA', number: 87, teamName: 'Haas', nationality: 'GB' },
  // Kick Sauber
  { name: 'Valtteri Bottas', abbreviation: 'BOT', number: 77, teamName: 'Kick Sauber', nationality: 'FI' },
  { name: 'Nico Hülkenberg', abbreviation: 'ZHO', number: 24, teamName: 'Kick Sauber', nationality: 'CN' },
  // Racing Bulls
  { name: 'Yuki Tsunoda', abbreviation: 'TSU', number: 22, teamName: 'Racing Bulls', nationality: 'JP' },
  { name: 'Isack Hadjar', abbreviation: 'HAD', number: 6, teamName: 'Racing Bulls', nationality: 'FR' },
];

// 2026 F1 calendar (provisional)
const races = [
  { slug: 'australia-2026', name: 'Australian Grand Prix', circuit: 'Albert Park Circuit', country: 'Australia', scheduledAt: new Date('2026-03-15') },
  { slug: 'china-2026', name: 'Chinese Grand Prix', circuit: 'Shanghai International Circuit', country: 'China', scheduledAt: new Date('2026-03-22') },
  { slug: 'japan-2026', name: 'Japanese Grand Prix', circuit: 'Suzuka International Racing Course', country: 'Japan', scheduledAt: new Date('2026-04-05') },
  { slug: 'bahrain-2026', name: 'Bahrain Grand Prix', circuit: 'Bahrain International Circuit', country: 'Bahrain', scheduledAt: new Date('2026-04-19') },
  { slug: 'saudi-arabia-2026', name: 'Saudi Arabian Grand Prix', circuit: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', scheduledAt: new Date('2026-04-26') },
  { slug: 'miami-2026', name: 'Miami Grand Prix', circuit: 'Miami International Autodrome', country: 'United States', scheduledAt: new Date('2026-05-10') },
  { slug: 'emilia-romagna-2026', name: 'Emilia Romagna Grand Prix', circuit: 'Autodromo Enzo e Dino Ferrari', country: 'Italy', scheduledAt: new Date('2026-05-24') },
  { slug: 'monaco-2026', name: 'Monaco Grand Prix', circuit: 'Circuit de Monaco', country: 'Monaco', scheduledAt: new Date('2026-05-31') },
  { slug: 'spain-2026', name: 'Spanish Grand Prix', circuit: 'Circuit de Barcelona-Catalunya', country: 'Spain', scheduledAt: new Date('2026-06-07') },
  { slug: 'canada-2026', name: 'Canadian Grand Prix', circuit: 'Circuit Gilles Villeneuve', country: 'Canada', scheduledAt: new Date('2026-06-21') },
  { slug: 'austria-2026', name: 'Austrian Grand Prix', circuit: 'Red Bull Ring', country: 'Austria', scheduledAt: new Date('2026-07-05') },
  { slug: 'britain-2026', name: 'British Grand Prix', circuit: 'Silverstone Circuit', country: 'United Kingdom', scheduledAt: new Date('2026-07-12') },
  { slug: 'belgium-2026', name: 'Belgian Grand Prix', circuit: 'Circuit de Spa-Francorchamps', country: 'Belgium', scheduledAt: new Date('2026-07-26') },
  { slug: 'hungary-2026', name: 'Hungarian Grand Prix', circuit: 'Hungaroring', country: 'Hungary', scheduledAt: new Date('2026-08-02') },
  { slug: 'netherlands-2026', name: 'Dutch Grand Prix', circuit: 'Circuit Zandvoort', country: 'Netherlands', scheduledAt: new Date('2026-08-30') },
  { slug: 'italy-2026', name: 'Italian Grand Prix', circuit: 'Autodromo Nazionale Monza', country: 'Italy', scheduledAt: new Date('2026-09-06') },
  { slug: 'azerbaijan-2026', name: 'Azerbaijan Grand Prix', circuit: 'Baku City Circuit', country: 'Azerbaijan', scheduledAt: new Date('2026-09-20') },
  { slug: 'singapore-2026', name: 'Singapore Grand Prix', circuit: 'Marina Bay Street Circuit', country: 'Singapore', scheduledAt: new Date('2026-10-04') },
  { slug: 'usa-2026', name: 'United States Grand Prix', circuit: 'Circuit of the Americas', country: 'United States', scheduledAt: new Date('2026-10-18') },
  { slug: 'mexico-2026', name: 'Mexico City Grand Prix', circuit: 'Autódromo Hermanos Rodríguez', country: 'Mexico', scheduledAt: new Date('2026-10-25') },
  { slug: 'brazil-2026', name: 'São Paulo Grand Prix', circuit: 'Autódromo José Carlos Pace', country: 'Brazil', scheduledAt: new Date('2026-11-08') },
  { slug: 'las-vegas-2026', name: 'Las Vegas Grand Prix', circuit: 'Las Vegas Strip Circuit', country: 'United States', scheduledAt: new Date('2026-11-21') },
  { slug: 'qatar-2026', name: 'Qatar Grand Prix', circuit: 'Lusail International Circuit', country: 'Qatar', scheduledAt: new Date('2026-11-29') },
  { slug: 'abu-dhabi-2026', name: 'Abu Dhabi Grand Prix', circuit: 'Yas Marina Circuit', country: 'United Arab Emirates', scheduledAt: new Date('2026-12-06') },
];

async function main() {
  console.log('Seeding database...');

  // Seed constructors
  for (const c of constructors) {
    await prisma.constructor.upsert({
      where: { name: c.name } as any,
      update: { shortName: c.shortName, color: c.color },
      create: { name: c.name, shortName: c.shortName, color: c.color },
    });
  }
  console.log(`✅ Seeded ${constructors.length} constructors`);

  // Seed drivers (skip duplicate "Nico Hülkenberg" — Zhou Guanyu had wrong name above)
  const uniqueDrivers = [
    { name: 'Max Verstappen', abbreviation: 'VER', number: 1, teamName: 'Red Bull Racing', nationality: 'NL' },
    { name: 'Liam Lawson', abbreviation: 'LAW', number: 30, teamName: 'Red Bull Racing', nationality: 'NZ' },
    { name: 'Charles Leclerc', abbreviation: 'LEC', number: 16, teamName: 'Ferrari', nationality: 'MC' },
    { name: 'Lewis Hamilton', abbreviation: 'HAM', number: 44, teamName: 'Ferrari', nationality: 'GB' },
    { name: 'George Russell', abbreviation: 'RUS', number: 63, teamName: 'Mercedes', nationality: 'GB' },
    { name: 'Andrea Kimi Antonelli', abbreviation: 'ANT', number: 12, teamName: 'Mercedes', nationality: 'IT' },
    { name: 'Lando Norris', abbreviation: 'NOR', number: 4, teamName: 'McLaren', nationality: 'GB' },
    { name: 'Oscar Piastri', abbreviation: 'PIA', number: 81, teamName: 'McLaren', nationality: 'AU' },
    { name: 'Fernando Alonso', abbreviation: 'ALO', number: 14, teamName: 'Aston Martin', nationality: 'ES' },
    { name: 'Lance Stroll', abbreviation: 'STR', number: 18, teamName: 'Aston Martin', nationality: 'CA' },
    { name: 'Pierre Gasly', abbreviation: 'GAS', number: 10, teamName: 'Alpine', nationality: 'FR' },
    { name: 'Jack Doohan', abbreviation: 'DOO', number: 7, teamName: 'Alpine', nationality: 'AU' },
    { name: 'Carlos Sainz', abbreviation: 'SAI', number: 55, teamName: 'Williams', nationality: 'ES' },
    { name: 'Alexander Albon', abbreviation: 'ALB', number: 23, teamName: 'Williams', nationality: 'TH' },
    { name: 'Nico Hülkenberg', abbreviation: 'HUL', number: 27, teamName: 'Haas', nationality: 'DE' },
    { name: 'Oliver Bearman', abbreviation: 'BEA', number: 87, teamName: 'Haas', nationality: 'GB' },
    { name: 'Valtteri Bottas', abbreviation: 'BOT', number: 77, teamName: 'Kick Sauber', nationality: 'FI' },
    { name: 'Zhou Guanyu', abbreviation: 'ZHO', number: 24, teamName: 'Kick Sauber', nationality: 'CN' },
    { name: 'Yuki Tsunoda', abbreviation: 'TSU', number: 22, teamName: 'Racing Bulls', nationality: 'JP' },
    { name: 'Isack Hadjar', abbreviation: 'HAD', number: 6, teamName: 'Racing Bulls', nationality: 'FR' },
  ];

  for (const d of uniqueDrivers) {
    const constructor = await prisma.constructor.findFirst({ where: { name: d.teamName } });
    await prisma.driver.upsert({
      where: { abbreviation: d.abbreviation } as any,
      update: {
        name: d.name,
        number: d.number,
        teamId: constructor?.id,
        nationality: d.nationality,
      },
      create: {
        name: d.name,
        abbreviation: d.abbreviation,
        number: d.number,
        teamId: constructor?.id,
        nationality: d.nationality,
      },
    });
  }
  console.log(`✅ Seeded ${uniqueDrivers.length} drivers`);

  // Seed races
  const now = new Date();
  for (const r of races) {
    await prisma.race.upsert({
      where: { slug: r.slug },
      update: {
        name: r.name,
        circuit: r.circuit,
        country: r.country,
        scheduledAt: r.scheduledAt,
        status: r.scheduledAt < now ? 'completed' : 'upcoming',
      },
      create: {
        slug: r.slug,
        name: r.name,
        circuit: r.circuit,
        country: r.country,
        scheduledAt: r.scheduledAt,
        status: r.scheduledAt < now ? 'completed' : 'upcoming',
      },
    });
  }
  console.log(`✅ Seeded ${races.length} races`);

  console.log('Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
