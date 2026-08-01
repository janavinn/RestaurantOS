"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const oldRestaurantId = '01f4a2b6-955c-4f92-ade9-bbfcec417a57';
    // Find current restaurant
    const currentRestaurant = await prisma.restaurant.findFirst();
    if (!currentRestaurant)
        return console.log('No restaurant found');
    if (currentRestaurant.id === oldRestaurantId) {
        return console.log('Restaurant already has the correct old ID');
    }
    console.log(`Migrating restaurant ${currentRestaurant.id} to ${oldRestaurantId}`);
    // We can't update a PK easily with relations if CASCADE update isn't on.
    // Instead, let's create a new restaurant with the old ID.
    await prisma.restaurant.create({
        data: {
            id: oldRestaurantId,
            name: currentRestaurant.name
        }
    });
    // Now update all related records to point to the new restaurant ID
    await prisma.user.updateMany({ data: { restaurantId: oldRestaurantId }, where: { restaurantId: currentRestaurant.id } });
    await prisma.menuCategory.updateMany({ data: { restaurantId: oldRestaurantId }, where: { restaurantId: currentRestaurant.id } });
    await prisma.menuItem.updateMany({ data: { restaurantId: oldRestaurantId }, where: { restaurantId: currentRestaurant.id } });
    // Delete the wrong restaurant
    await prisma.restaurant.delete({ where: { id: currentRestaurant.id } });
    console.log('Successfully restored the old Restaurant ID!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=fix_restaurant_id.js.map