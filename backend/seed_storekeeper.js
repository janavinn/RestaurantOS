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
        console.log("No restaurant found. Run basic setup first.");
        return;
    }
    // Create a STORE_KEEPER
    const existingKeeper = await prisma.user.findFirst({ where: { role: 'STORE_KEEPER' } });
    if (!existingKeeper) {
        const hashedPin = await bcrypt_1.default.hash('5555', 10);
        const keeper = await prisma.user.create({
            data: {
                name: 'Ravi (Store Keeper)',
                email: 'storekeeper@example.com',
                role: 'STORE_KEEPER',
                status: 'ACTIVE',
                pin: hashedPin,
                shift: 'Morning',
                phone: '1234567894',
                restaurantId: restaurant.id
            }
        });
        console.log('Created Store Keeper:', keeper.name, 'with PIN 5555');
    }
    else {
        console.log('Store Keeper already exists:', existingKeeper.name);
    }
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed_storekeeper.js.map