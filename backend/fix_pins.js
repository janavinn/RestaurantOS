"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany();
    for (const user of users) {
        if (user.pin && !user.pin.startsWith('$2b$')) {
            const hashedPin = await bcrypt_1.default.hash(user.pin, 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { pin: hashedPin }
            });
        }
    }
    console.log('Fixed pins successfully!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=fix_pins.js.map