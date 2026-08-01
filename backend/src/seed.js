"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    // Find a restaurant to attach these to
    let restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
        restaurant = await prisma.restaurant.create({
            data: { name: 'Aarunya Restaurant' }
        });
    }
    const rId = restaurant.id;
    // Clear existing data to prevent duplicates
    await prisma.activityLog.deleteMany({ where: { restaurantId: rId } });
    await prisma.ingredient.deleteMany({ where: { restaurantId: rId } });
    await prisma.purchaseOrder.deleteMany({ where: { restaurantId: rId } });
    await prisma.expense.deleteMany({ where: { restaurantId: rId } });
    await prisma.orderItem.deleteMany({ where: { order: { restaurantId: rId } } });
    await prisma.order.deleteMany({ where: { restaurantId: rId } });
    await prisma.menuItem.deleteMany({ where: { restaurantId: rId } });
    // 1. Create Menu Items
    const menuItemsData = [
        { name: 'Paneer Butter Masala', price: 280, category: 'Mains', img: '🥘' },
        { name: 'Veg Biryani', price: 220, category: 'Mains', img: '🍲' },
        { name: 'Masala Dosa', price: 150, category: 'Mains', img: '🥞' },
        { name: 'Gulab Jamun', price: 80, category: 'Desserts', img: '🍨' },
        { name: 'Veg Manchurian', price: 180, category: 'Starters', img: '🧆' }
    ];
    const menuItems = [];
    for (const item of menuItemsData) {
        const mi = await prisma.menuItem.create({
            data: { ...item, restaurantId: rId }
        });
        menuItems.push(mi);
    }
    // 2. Generate 30 days of Orders & Expenses
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        // Random number of orders per day (20 to 50)
        const numOrders = Math.floor(Math.random() * 30) + 20;
        for (let j = 0; j < numOrders; j++) {
            // Create order
            const order = await prisma.order.create({
                data: {
                    total: 0,
                    status: 'COMPLETED',
                    createdAt: date,
                    restaurantId: rId
                }
            });
            let orderTotal = 0;
            // Random 1 to 4 items per order
            const numItems = Math.floor(Math.random() * 4) + 1;
            for (let k = 0; k < numItems; k++) {
                const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
                const qty = Math.floor(Math.random() * 2) + 1;
                const price = menuItem.price;
                await prisma.orderItem.create({
                    data: {
                        orderId: order.id,
                        menuItemId: menuItem.id,
                        quantity: qty,
                        price: price
                    }
                });
                orderTotal += price * qty;
            }
            // Update order total
            await prisma.order.update({
                where: { id: order.id },
                data: { total: orderTotal }
            });
        }
        // Daily Expenses (1 per day randomly)
        if (Math.random() > 0.5) {
            await prisma.expense.create({
                data: {
                    category: ['Utilities', 'Maintenance', 'Marketing', 'Supplies'][Math.floor(Math.random() * 4)],
                    description: 'Daily operational cost',
                    amount: Math.floor(Math.random() * 5000) + 1000,
                    date: date,
                    status: 'APPROVED',
                    restaurantId: rId
                }
            });
        }
        // Purchase Orders (every 3 days)
        if (i % 3 === 0) {
            await prisma.purchaseOrder.create({
                data: {
                    supplier: ['FreshFarm Produce', 'Ocean Catch Seafood', 'Gourmet Imports'][Math.floor(Math.random() * 3)],
                    total: Math.floor(Math.random() * 40000) + 10000,
                    status: 'RECEIVED',
                    date: date,
                    restaurantId: rId
                }
            });
        }
    }
    // 3. Ingredients (Low Stock)
    const ingredients = [
        { name: 'Tomatoes', stockLevel: 2, minStock: 10, unit: 'kg' },
        { name: 'Chicken Breast', stockLevel: 1.5, minStock: 5, unit: 'kg' },
        { name: 'Basmati Rice', stockLevel: 5, minStock: 20, unit: 'kg' },
        { name: 'Olive Oil', stockLevel: 0.75, minStock: 3, unit: 'L' },
        { name: 'Onions', stockLevel: 4, minStock: 15, unit: 'kg' }
    ];
    for (const ing of ingredients) {
        await prisma.ingredient.create({
            data: { ...ing, restaurantId: rId }
        });
    }
    // 4. Activity Logs
    await prisma.activityLog.createMany({
        data: [
            { type: 'purchase', title: 'New purchase order #PO5678', restaurantId: rId },
            { type: 'stock', title: 'Stock in received for Tomatoes (20 kg)', restaurantId: rId },
            { type: 'expense', title: 'Payment of ₹18,500 to Supplier FreshFoods', restaurantId: rId },
            { type: 'staff', title: 'New staff Rahul Kumar added', restaurantId: rId }
        ]
    });
    console.log('Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map