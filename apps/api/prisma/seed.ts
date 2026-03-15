// Seed script for categories A..E
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { code: 'A', label: 'Category A' },
    { code: 'B', label: 'Category B' },
    { code: 'C', label: 'Category C' },
    { code: 'D', label: 'Category D' },
    { code: 'E', label: 'Category E' },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    });
  }
  console.log('Seeded categories A..E');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
