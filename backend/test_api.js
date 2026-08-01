"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';
async function test() {
    const owner = await prisma.user.findFirst({ where: { role: 'OWNER' } });
    if (!owner)
        return console.log('No owner found');
    const token = jsonwebtoken_1.default.sign({ id: owner.id, role: owner.role, restaurantId: owner.restaurantId }, JWT_SECRET, { expiresIn: '1d' });
    // 1. Test Invite
    console.log('Testing Invite...');
    const inviteRes = await fetch('http://localhost:5000/api/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: 'Test User', email: `test${Date.now()}@test.com`, role: 'WAITER' })
    });
    const inviteData = await inviteRes.json();
    console.log('Invite Status:', inviteRes.status);
    console.log('Invite Response:', inviteData);
    if (!inviteData.user)
        return;
    // 2. Test Delete
    console.log('\nTesting Delete...');
    const deleteRes = await fetch(`http://localhost:5000/api/staff/${inviteData.user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const deleteData = await deleteRes.json();
    console.log('Delete Status:', deleteRes.status);
    console.log('Delete Response:', deleteData);
}
test().catch(console.error);
//# sourceMappingURL=test_api.js.map