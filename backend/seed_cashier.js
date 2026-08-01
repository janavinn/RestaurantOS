"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
        console.log('No restaurant found');
        return;
    }
    const hashedPin = await bcrypt_1.default.hash('3333', 10);
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
//# sourceMappingURL=seed_cashier.js.map