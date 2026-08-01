import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.create({
    data: { name: 'Demo Restaurant' }
  });

  await prisma.user.createMany({
    data: [
      { name: 'Owner', email: 'owner@demo.com', role: 'OWNER', status: 'ACTIVE', pin: '0000', restaurantId: restaurant.id },
      { name: 'Priya', email: 'manager@demo.com', role: 'MANAGER', status: 'ACTIVE', pin: '1111', restaurantId: restaurant.id },
      { name: 'Divya', email: 'chef@demo.com', role: 'CHEF', status: 'ACTIVE', pin: '2222', restaurantId: restaurant.id },
      { name: 'Waiter', email: 'waiter@demo.com', role: 'WAITER', status: 'ACTIVE', pin: '3333', restaurantId: restaurant.id },
    ]
  });

  const categories = await prisma.menuCategory.createManyAndReturn({
    data: [
      { name: 'Starters', restaurantId: restaurant.id },
      { name: 'Mains', restaurantId: restaurant.id },
      { name: 'Desserts', restaurantId: restaurant.id },
      { name: 'Drinks', restaurantId: restaurant.id },
    ]
  });

  await prisma.menuItem.createMany({
    data: [
      { name: 'Paneer Tikka', categoryId: categories[0].id, price: 280, available: true, restaurantId: restaurant.id },
      { name: 'Chicken Biryani', categoryId: categories[1].id, price: 320, available: true, restaurantId: restaurant.id },
      { name: 'Veg Lasagna', categoryId: categories[1].id, price: 350, available: true, restaurantId: restaurant.id },
    ]
  });

  console.log('Database seeded with users and menu items!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
