"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';
// Middleware to verify JWT
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
// ==========================================
// 1. SETUP OWNER
// ==========================================
app.post('/api/admin/setup', async (req, res) => {
    const { restaurantName, ownerName, ownerEmail, password } = req.body;
    if (!restaurantName || !ownerName || !ownerEmail || !password)
        return res.status(400).json({ error: 'All fields required' });
    try {
        const existing = await prisma.user.findUnique({ where: { email: ownerEmail } });
        if (existing)
            return res.status(400).json({ error: 'User already exists' });
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const result = await prisma.$transaction(async (tx) => {
            const restaurant = await tx.restaurant.create({ data: { name: restaurantName } });
            const owner = await tx.user.create({
                data: { name: ownerName, email: ownerEmail, passwordHash, role: 'OWNER', status: 'ACTIVE', restaurantId: restaurant.id },
            });
            return { restaurant, owner };
        });
        const { passwordHash: _, ...ownerSafe } = result.owner;
        res.status(201).json({ message: 'Success', restaurant: result.restaurant, owner: ownerSafe });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal error' });
    }
});
// ==========================================
// 2. LOGIN
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash)
            return res.status(401).json({ error: 'Invalid credentials' });
        if (user.status !== 'ACTIVE')
            return res.status(403).json({ error: 'Account is not active' });
        const isValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isValid)
            return res.status(401).json({ error: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, restaurantId: user.restaurantId }, JWT_SECRET, { expiresIn: '1d' });
        const { passwordHash, activationToken, ...safeUser } = user;
        res.json({ token, user: safeUser });
    }
    catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});
// ==========================================
// 4. ACTIVATE STAFF
// ==========================================
app.post('/api/staff/activate', async (req, res) => {
    const { token, pin } = req.body;
    if (!token || !pin)
        return res.status(400).json({ error: 'Token and pin required' });
    try {
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await prisma.user.findUnique({ where: { activationToken: hashedToken } });
        if (!user)
            return res.status(400).json({ error: 'Invalid activation token' });
        if (user.activationExpires && user.activationExpires < new Date()) {
            return res.status(400).json({ error: 'Token has expired' });
        }
        const pinHash = await bcrypt_1.default.hash(pin, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                pin: pinHash,
                status: 'ACTIVE',
                activationToken: null,
                activationExpires: null
            }
        });
        res.json({
            message: 'Account activated successfully. You can now login.',
            user: {
                name: user.name,
                role: user.role
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to activate account' });
    }
});
// ==========================================
// 5. PIN LOGIN
// ==========================================
app.post('/api/auth/pin-login', async (req, res) => {
    const { userId, pin } = req.body;
    if (!userId || !pin)
        return res.status(400).json({ error: 'User ID and PIN required' });
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.pin)
            return res.status(401).json({ error: 'Invalid credentials or PIN not set' });
        if (user.status !== 'ACTIVE')
            return res.status(403).json({ error: 'Account is not active' });
        const isValid = await bcrypt_1.default.compare(pin, user.pin);
        if (!isValid)
            return res.status(401).json({ error: 'Incorrect PIN' });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, restaurantId: user.restaurantId }, JWT_SECRET, { expiresIn: '1d' });
        const { passwordHash, pin: _, activationToken, ...safeUser } = user;
        res.json({ token, user: safeUser });
    }
    catch (err) {
        res.status(500).json({ error: 'PIN Login failed' });
    }
});
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const menu_1 = __importDefault(require("./routes/menu"));
const orders_1 = __importDefault(require("./routes/orders"));
const staff_1 = __importDefault(require("./routes/staff"));
const tables_1 = __importDefault(require("./routes/tables"));
const purchaseOrders_1 = __importDefault(require("./routes/purchaseOrders"));
const suppliers_1 = __importDefault(require("./routes/suppliers"));
const roles_1 = __importDefault(require("./routes/roles"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const manager_1 = __importDefault(require("./routes/manager"));
const purchaseRequests_1 = __importDefault(require("./routes/purchaseRequests"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const reports_1 = __importDefault(require("./routes/reports"));
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/menu', menu_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/staff', staff_1.default);
app.use('/api/tables', tables_1.default);
app.use('/api/purchase-orders', purchaseOrders_1.default);
app.use('/api/suppliers', suppliers_1.default);
app.use('/api/roles', roles_1.default);
app.use('/api/expenses', expenses_1.default);
app.use('/api/manager', manager_1.default);
app.use('/api/purchase-requests', purchaseRequests_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/reports', reports_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map