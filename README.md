# RestaurantOS – AI Powered Restaurant Management Platform

RestaurantOS is a modern, full-stack, multi-tenant restaurant management system built to streamline everything from order taking and table management to inventory and AI-powered invoice processing.

## Live Application
- **Frontend (Live):** [https://restaurant-os-fjqs.vercel.app](https://restaurant-os-fjqs.vercel.app)
- **Backend API:** [https://restaurantos-d87w.onrender.com](https://restaurantos-d87w.onrender.com)

## Key Features
- **Role-Based Access Control:** Distinct portals and dashboards for Owners, Managers, Chefs, Waiters, Store Keepers, and Cashiers.
- **Smart Order & Table Management:** Real-time POS system for waiters to take orders, manage tables, and generate bills.
- **Kitchen Display System (KDS):** Dedicated screens for chefs to view, prepare, and complete incoming orders.
- **Inventory & Supply Chain:** Track ingredient stock levels, manage purchase requests, and handle purchase orders.
- **AI Invoice Processing:** Automated supplier invoice digitization (Extracting line items and updating inventory via AI).
- **Secure Authentication:** JWT-based authentication, Staff PIN login, and secure password reset flow.
- **Financial Reporting:** View daily sales, track expenses, and manage tax (GST) calculations.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, React Router, Lucide Icons, Vanilla CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL (Neon DB) & Prisma ORM
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/janavinn/RestaurantOS.git
cd RestaurantOS
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`
Create a `.env` file in the `backend` directory with the following variables:
\`\`\`env
DATABASE_URL="postgres://your_neon_db_connection_string"
JWT_SECRET="your_secret_key"
PORT=5000
\`\`\`
Initialize the database:
\`\`\`bash
npx prisma db push
npx prisma generate
\`\`\`
Start the development server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup
Open a new terminal window:
\`\`\`bash
cd frontend
npm install
\`\`\`
Create a `.env` file in the `frontend` directory:
\`\`\`env
VITE_API_URL="http://localhost:5000"
\`\`\`
Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

### 4. Testing the App
1. Go to `http://localhost:5173/register` to initialize your first Restaurant and Owner account.
2. Login to the Owner Dashboard to create staff roles and manage your menu.

---
*Built as part of the Full Stack Developer Technical Assessment.*
