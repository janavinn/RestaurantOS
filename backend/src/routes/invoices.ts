import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as xlsx from 'xlsx';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

// Setup multer for in-memory file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Setup Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key_for_now');

// Auth middleware
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

router.use(authenticate);

// POST: Process invoice with AI
router.post('/process', upload.single('invoice'), async (req: Request, res: Response): Promise<any> => {
  if (!req.file) {
    return res.status(400).json({ error: 'No invoice file uploaded' });
  }

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock_key_for_now') {
      // Mock mode for local testing if API key isn't provided
      console.log('No GEMINI_API_KEY provided, returning mock data.');
      return res.json({
        supplier: 'Andrews, Kirby and Valdez',
        invoiceNumber: 'INV-12345',
        date: '2013-04-13',
        total: 6204.19,
        items: [{ description: "Sample Item", qty: 2, price: 50.00, total: 100.00 }],
        status: 'RECEIVED'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    
    // Prepare image part
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype
      }
    };

    const prompt = `
      You are an expert AI invoice processor.
      Extract the following information from the provided invoice image:
      1. invoiceNumber: The unique invoice number or ID.
      2. supplier: The name of the seller or supplier company.
      3. date: The date of the invoice (format as YYYY-MM-DD).
      4. total: The final total amount or gross worth of the invoice (as a plain number, no currency symbols).
      5. items: A list of line items on the invoice. For each item, extract description, quantity (qty), unit price (price), and total price (total).
      
      Respond STRICTLY with a valid JSON object matching this schema, with no markdown formatting or extra text:
      {
        "invoiceNumber": "string",
        "supplier": "string",
        "date": "YYYY-MM-DD",
        "total": number,
        "items": [
          {
            "description": "string",
            "qty": number,
            "price": number,
            "total": number
          }
        ]
      }
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text().trim();
    
    // Strip markdown blocks if present
    if (text.startsWith('```json')) {
      text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsedData = JSON.parse(text);
    
    res.json({
      invoiceNumber: parsedData.invoiceNumber || 'UNKNOWN',
      supplier: parsedData.supplier || 'Unknown Supplier',
      date: parsedData.date || new Date().toISOString().split('T')[0],
      total: parsedData.total || 0,
      items: parsedData.items || [],
      status: 'RECEIVED'
    });

  } catch (error) {
    console.error('AI Processing Error:', error);
    res.status(500).json({ error: 'Failed to process invoice with AI.' });
  }
});

// POST: Save confirmed invoice
router.post('/confirm', async (req: Request, res: Response): Promise<any> => {
  const restaurantId = (req as any).user.restaurantId;
  const { invoiceNumber, supplier, total, date, status, items } = req.body;

  try {
    const po = await prisma.purchaseOrder.create({
      data: {
        restaurantId,
        supplier,
        invoiceNumber: invoiceNumber || null,
        items: items || [],
        total: parseFloat(total),
        status: status || 'RECEIVED',
        date: new Date(date || Date.now())
      }
    });

    // Create an associated expense record
    await prisma.expense.create({
      data: {
        restaurantId,
        category: 'Supplier Invoice',
        description: `Invoice from ${supplier}`,
        amount: parseFloat(total),
        status: 'APPROVED',
        date: new Date(date || Date.now())
      }
    });

    // Also update Supplier record (find or create)
    let existingSupplier = await prisma.supplier.findFirst({
      where: { restaurantId, name: supplier }
    });

    if (existingSupplier) {
      await prisma.supplier.update({
        where: { id: existingSupplier.id },
        data: { purchases: { increment: parseFloat(total) } }
      });
    } else {
      await prisma.supplier.create({
        data: {
          restaurantId,
          name: supplier,
          type: 'Vendor',
          purchases: parseFloat(total),
          payables: 0
        }
      });
    }

    res.json(po);
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Failed to save confirmed invoice' });
  }
});

// GET: Export Expense Register to Excel
router.get('/export', async (req: Request, res: Response): Promise<any> => {
  const restaurantId = (req as any).user.restaurantId;

  try {
    const invoices = await prisma.purchaseOrder.findMany({
      where: { restaurantId },
      orderBy: { date: 'desc' }
    });

    const workbook = new xlsx.utils.book_new();
    const worksheetData = invoices.map(inv => ({
      'Invoice No': inv.invoiceNumber || 'N/A',
      'Supplier': inv.supplier,
      'Date': new Date(inv.date).toLocaleDateString(),
      'Amount': inv.total,
      'Items Count': Array.isArray(inv.items) ? inv.items.length : 0,
      'Status': inv.status
    }));

    const worksheet = xlsx.utils.json_to_sheet(worksheetData);
    
    // Auto-fit columns
    const wscols = [
      { wch: 20 }, // Invoice No
      { wch: 25 }, // Supplier
      { wch: 15 }, // Date
      { wch: 12 }, // Amount
      { wch: 15 }, // Items Count
      { wch: 15 }  // Status
    ];
    worksheet['!cols'] = wscols;

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Expense Register');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename="Expense_Register.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Failed to export expense register' });
  }
});

export default router;
