import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

// Middleware to verify JWT
const authenticate = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ==========================================
// 1. SETUP OWNER
// ==========================================
app.post('/api/admin/setup', async (req: Request, res: Response): Promise<any> => {
  const { restaurantName, ownerName, ownerEmail, password } = req.body;
  if (!restaurantName || !ownerName || !ownerEmail || !password) return res.status(400).json({ error: 'All fields required' });

  try {
    const existing = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({ data: { name: restaurantName } });
      const owner = await tx.user.create({
        data: { name: ownerName, email: ownerEmail, passwordHash, role: 'OWNER', status: 'ACTIVE', restaurantId: restaurant.id },
      });
      return { restaurant, owner };
    });

    const { passwordHash: _, ...ownerSafe } = result.owner;
    res.status(201).json({ message: 'Success', restaurant: result.restaurant, owner: ownerSafe });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

// ==========================================
// 2. LOGIN
// ==========================================
app.post('/api/auth/login', async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });
    
    if (user.status !== 'ACTIVE') return res.status(403).json({ error: 'Account is not active' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role, restaurantId: user.restaurantId }, JWT_SECRET, { expiresIn: '1d' });
    
    const { passwordHash, activationToken, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});


// ==========================================
// 4. ACTIVATE STAFF
// ==========================================
app.post('/api/staff/activate', async (req: Request, res: Response): Promise<any> => {
  const { token, pin } = req.body;
  if (!token || !pin) return res.status(400).json({ error: 'Token and pin required' });

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findUnique({ where: { activationToken: hashedToken } });
    
    if (!user) return res.status(400).json({ error: 'Invalid activation token' });
    if (user.activationExpires && user.activationExpires < new Date()) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    const pinHash = await bcrypt.hash(pin, 10);
    
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to activate account' });
  }
});

// ==========================================
// 5. PIN LOGIN
// ==========================================
app.post('/api/auth/pin-login', async (req: Request, res: Response): Promise<any> => {
  const { userId, pin } = req.body;
  
  if (!userId || !pin) return res.status(400).json({ error: 'User ID and PIN required' });
  
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user || !user.pin) return res.status(401).json({ error: 'Invalid credentials or PIN not set' });
    if (user.status !== 'ACTIVE') return res.status(403).json({ error: 'Account is not active' });
    
    const isValid = await bcrypt.compare(pin, user.pin);
    if (!isValid) return res.status(401).json({ error: 'Incorrect PIN' });
    
    const token = jwt.sign({ id: user.id, role: user.role, restaurantId: user.restaurantId }, JWT_SECRET, { expiresIn: '1d' });
    
    const { passwordHash, pin: _, activationToken, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'PIN Login failed' });
  }
});



import dashboardRoutes from './routes/dashboard';
import menuRoutes from './routes/menu';
import ordersRoutes from './routes/orders';
import staffRoutes from './routes/staff';
import tablesRoutes from './routes/tables';
import purchaseOrdersRoutes from './routes/purchaseOrders';
import suppliersRoutes from './routes/suppliers';
import rolesRoutes from './routes/roles';
import expensesRoutes from './routes/expenses';
import managerRoutes from './routes/manager';
import purchaseRequestsRouter from './routes/purchaseRequests';
import inventoryRoutes from './routes/inventory';
import reportsRouter from './routes/reports';
import invoicesRouter from './routes/invoices';

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/purchase-orders', purchaseOrdersRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/purchase-requests', purchaseRequestsRouter);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportsRouter);
app.use('/api/invoices', invoicesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
