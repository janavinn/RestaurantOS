import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const oldRestaurantId = '01f4a2b6-955c-4f92-ade9-bbfcec417a57';
  
  await prisma.ingredient.deleteMany({ where: { restaurantId: oldRestaurantId } });

  await prisma.ingredient.createMany({
    data: [
      { name: 'Tomatoes', category: 'Vegetables', stockLevel: 2, minStock: 10, unit: 'kg', supplierName: 'FreshFoods Pvt Ltd', restaurantId: oldRestaurantId },
      { name: 'Onions', category: 'Vegetables', stockLevel: 15, minStock: 10, unit: 'kg', supplierName: 'FreshFoods Pvt Ltd', restaurantId: oldRestaurantId },
      { name: 'Rice', category: 'Grains', stockLevel: 50, minStock: 20, unit: 'kg', supplierName: 'Agro Supplies', restaurantId: oldRestaurantId },
      { name: 'Chicken', category: 'Meat', stockLevel: 25, minStock: 15, unit: 'kg', supplierName: 'Premium Meats', restaurantId: oldRestaurantId },
      { name: 'Cooking Oil', category: 'Pantry', stockLevel: 1, minStock: 5, unit: 'litre', supplierName: 'Agro Supplies', restaurantId: oldRestaurantId },
      { name: 'Milk', category: 'Dairy', stockLevel: 10, minStock: 12, unit: 'litre', supplierName: 'Happy Cows Dairy', restaurantId: oldRestaurantId },
    ]
  });

  console.log('Seeded ingredients!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
