import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' }),
});

async function main() {
  await prisma.estimate.create({
    data: {
      customerName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '555-0123',
      serviceType: 'Digital Printing',
      hasImage: true,
      width: '24',
      height: '36',
      unit: 'inches',
      dimensions: '24x36',
      quantity: '50',
      paperStock: 'Standard 80lb',
      finish: 'Matte',
      notes: 'Seeding test',
      imagePath: 'uploads/placeholder.jpg',
    },
  });
  console.log('Seeding complete!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
