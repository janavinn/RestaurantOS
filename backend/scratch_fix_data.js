"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany();
    console.log('Users:', users);
    const restaurants = await prisma.restaurant.findMany();
    console.log('Restaurants:', restaurants);
    if (users.length > 0 && restaurants.length > 0) {
        const mainRestaurantId = '01f4a2b6-955c-4f92-ade9-bbfcec417a57';
        // Update everything to belong to the main restaurant
        await prisma.menuItem.updateMany({ data: { restaurantId: mainRestaurantId } });
        await prisma.order.updateMany({ data: { restaurantId: mainRestaurantId } });
        await prisma.expense.updateMany({ data: { restaurantId: mainRestaurantId } });
        await prisma.purchaseOrder.updateMany({ data: { restaurantId: mainRestaurantId } });
        await prisma.activityLog.updateMany({ data: { restaurantId: mainRestaurantId } });
        await prisma.ingredient.updateMany({ data: { restaurantId: mainRestaurantId } });
        console.log('Updated all records to belong to restaurant:', mainRestaurantId);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=scratch_fix_data.js.map