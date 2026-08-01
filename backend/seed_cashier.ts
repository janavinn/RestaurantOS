import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.findFirst();
  if (!restaurant) {
    console.log('No restaurant found');
    return;
  }

  const hashedPin = await bcrypt.hash('3333', 10);

  // Create Cashier
  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@aarunya.com' },
    update: { pin: hashedPin },
    create: {
      name: 'Rohan (Cashier)',
      email: 'cashier@aarunya.com',
      pin: hashedPin,
      role: 'CASHIER',
      status: 'ACTIVE',
      restaurantId: restaurant.id,
      shift: 'Full Day'
    },
  });

  console.log('Updated Cashier:', cashier);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
