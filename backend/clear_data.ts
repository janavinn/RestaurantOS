import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Delete all transaction data
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.activityLog.deleteMany({});
  
  // Optionally reset stock levels if we want
  await prisma.ingredient.updateMany({
    data: { stockLevel: 0 }
  });

  console.log('Dummy data cleared successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
