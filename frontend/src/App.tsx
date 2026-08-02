import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Login from './pages/Login';
import StaffLogin from './pages/StaffLogin';
import Register from './pages/Register';
import Activate from './pages/Activate';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import StaffManagement from './pages/StaffManagement';
import RolePermissions from './pages/RolePermissions';
import SupplierManagement from './pages/SupplierManagement';
import IngredientManagement from './pages/IngredientManagement';
import RecipeManagement from './pages/RecipeManagement';
import MenuManagement from './pages/MenuManagement';
import InventoryOverview from './pages/InventoryOverview';
import ProductManagement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import PurchaseOrders from './pages/PurchaseOrders';
import StockLog from './pages/StockLog';
import ExpenseManagement from './pages/ExpenseManagement';
import SupplierInvoices from './pages/SupplierInvoices';
import ReportsAnalytics from './pages/ReportsAnalytics';
import ProfileSettings from './pages/ProfileSettings';
import Preferences from './pages/Preferences';
import DashboardLayout from './components/DashboardLayout';
import KitchenOrders from './pages/KitchenOrders';
import KitchenAlerts from './pages/KitchenAlerts';
import PrepList from './pages/PrepList';
import WaiterOrders from './pages/WaiterOrders';
import TableManagement from './pages/TableManagement';
import TableAdmin from './pages/TableAdmin';
import CashierDashboard from './pages/CashierDashboard';
import CashierBilling from './pages/CashierBilling';
import CashierPayments from './pages/CashierPayments';
import CashierTransactions from './pages/CashierTransactions';
import ManagerDashboard from './pages/ManagerDashboard';
import PurchaseRequests from './pages/PurchaseRequests';
import DailyReports from './pages/DailyReports';
import StoreKeeperDashboard from './pages/StoreKeeperDashboard';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { urlRole, urlUsername } = useParams();
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    if (urlRole?.toLowerCase() === 'owner') {
      return <Navigate to="/aarunya/owner/login" replace />;
    }
    return <Navigate to="/aarunya/staff/login" replace />;
  }
  
  const user = JSON.parse(userStr);
  const role = user.role || 'OWNER';
  const nameSlug = (user.name || 'user').toLowerCase().replace(/\s+/g, '-');
  
  if (urlRole && urlRole.toLowerCase() !== role.toLowerCase()) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to={urlRole?.toLowerCase() === 'owner' ? '/aarunya/owner/login' : '/aarunya/staff/login'} replace />;
  }
  
  if (urlUsername && urlUsername.toLowerCase() !== nameSlug) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to={urlRole?.toLowerCase() === 'owner' ? '/aarunya/owner/login' : '/aarunya/staff/login'} replace />;
  }
  
  if (!allowedRoles.includes(role)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }
  
  return <>{children}</>;
};

const RootRedirect = () => {
  const { urlRole, urlUsername } = useParams();
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    if (urlRole?.toLowerCase() === 'owner') {
      return <Navigate to="/aarunya/owner/login" replace />;
    }
    return <Navigate to="/aarunya/staff/login" replace />;
  }
  
  const user = JSON.parse(userStr);
  const roleSlug = (user.role || 'owner').toLowerCase();
  const nameSlug = (user.name || 'user').toLowerCase().replace(/\s+/g, '-');
  
  if (urlRole && urlRole.toLowerCase() !== roleSlug) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to={urlRole?.toLowerCase() === 'owner' ? '/aarunya/owner/login' : '/aarunya/staff/login'} replace />;
  }
  
  if (urlUsername && urlUsername.toLowerCase() !== nameSlug) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to={urlRole?.toLowerCase() === 'owner' ? '/aarunya/owner/login' : '/aarunya/staff/login'} replace />;
  }
  
  if (user.role === 'CHEF') return <Navigate to={`/${roleSlug}/${nameSlug}/kitchen-orders`} replace />;
  if (user.role === 'WAITER') return <Navigate to={`/${roleSlug}/${nameSlug}/tables`} replace />;
  if (user.role === 'STORE_KEEPER') return <Navigate to={`/${roleSlug}/${nameSlug}/store-keeper`} replace />;
  if (user.role === 'CASHIER') return <Navigate to={`/${roleSlug}/${nameSlug}/cashier-overview`} replace />;
  return <Navigate to={`/${roleSlug}/${nameSlug}/dashboard`} replace />;
};

const DashboardRouter = () => {
  const { urlRole } = useParams();
  if (urlRole?.toLowerCase() === 'manager') return <ManagerDashboard />;
  return <Dashboard />;
};

function App() {
  const ALL_ROLES = ['OWNER', 'MANAGER', 'CHEF', 'WAITER', 'STORE_KEEPER', 'CASHIER'];
  const BACK_OFFICE = ['OWNER', 'MANAGER'];

  return (
    <BrowserRouter>
      <Routes>
        {/* Global Access Routes */}
        <Route path="/aarunya/owner/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup-account" element={<Activate />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* POS-Style Staff Login */}
        <Route path="/aarunya/staff/login" element={<StaffLogin />} />
        
        {/* Backward Compatibility Redirects */}
        <Route path="/owner/login" element={<Navigate to="/aarunya/owner/login" replace />} />
        <Route path="/staff/login" element={<Navigate to="/aarunya/staff/login" replace />} />
        <Route path="/staff-login" element={<Navigate to="/aarunya/staff/login" replace />} />
        
        {/* Global Root Redirect */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Personalized Namespaces with Layout */}
        <Route path="/:urlRole/:urlUsername" element={<DashboardLayout />}>
          <Route index element={<RootRedirect />} />
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><DashboardRouter /></ProtectedRoute>} />
          <Route path="staff" element={<ProtectedRoute allowedRoles={BACK_OFFICE}><StaffManagement /></ProtectedRoute>} />
          <Route path="roles" element={<ProtectedRoute allowedRoles={['OWNER']}><RolePermissions /></ProtectedRoute>} />
          <Route path="table-admin" element={<ProtectedRoute allowedRoles={BACK_OFFICE}><TableAdmin /></ProtectedRoute>} />
          <Route path="suppliers" element={<ProtectedRoute allowedRoles={BACK_OFFICE}><SupplierManagement /></ProtectedRoute>} />
          <Route path="ingredients" element={<ProtectedRoute allowedRoles={[...BACK_OFFICE, 'CHEF']}><IngredientManagement /></ProtectedRoute>} />
          <Route path="recipes" element={<ProtectedRoute allowedRoles={[...BACK_OFFICE, 'CHEF']}><RecipeManagement /></ProtectedRoute>} />
          <Route path="menu" element={<ProtectedRoute allowedRoles={BACK_OFFICE}><MenuManagement /></ProtectedRoute>} />
          
          {/* Chef Specific Routes */}
          <Route path="kitchen-orders" element={<ProtectedRoute allowedRoles={['CHEF', ...BACK_OFFICE]}><KitchenOrders /></ProtectedRoute>} />
          <Route path="kitchen-alerts" element={<ProtectedRoute allowedRoles={['CHEF', ...BACK_OFFICE]}><KitchenAlerts /></ProtectedRoute>} />
          <Route path="prep-list" element={<ProtectedRoute allowedRoles={['CHEF', ...BACK_OFFICE]}><PrepList /></ProtectedRoute>} />
          
          {/* Waiter Specific Routes */}
          <Route path="tables" element={<ProtectedRoute allowedRoles={['WAITER', ...BACK_OFFICE]}><TableManagement /></ProtectedRoute>} />
          <Route path="my-orders" element={<ProtectedRoute allowedRoles={['WAITER', ...BACK_OFFICE]}><WaiterOrders /></ProtectedRoute>} />

          {/* Inventory Routes */}
          <Route path="inventory" element={<ProtectedRoute allowedRoles={['MANAGER', 'STORE_KEEPER']}><InventoryOverview /></ProtectedRoute>} />
          <Route path="products" element={<ProtectedRoute allowedRoles={BACK_OFFICE}><ProductManagement /></ProtectedRoute>} />
          <Route path="categories" element={<ProtectedRoute allowedRoles={BACK_OFFICE}><CategoryManagement /></ProtectedRoute>} />
          <Route path="purchase-orders" element={<ProtectedRoute allowedRoles={['OWNER']}><PurchaseOrders /></ProtectedRoute>} />
          <Route path="purchase-requests" element={<ProtectedRoute allowedRoles={['MANAGER', 'STORE_KEEPER']}><PurchaseRequests /></ProtectedRoute>} />
          <Route path="stock-log" element={<ProtectedRoute allowedRoles={[...BACK_OFFICE, 'CHEF', 'STORE_KEEPER']}><StockLog /></ProtectedRoute>} />
          <Route path="store-keeper" element={<ProtectedRoute allowedRoles={['STORE_KEEPER', 'OWNER']}><StoreKeeperDashboard /></ProtectedRoute>} />

          {/* Cashier Routes */}
          <Route path="cashier-overview" element={<ProtectedRoute allowedRoles={['CASHIER', 'OWNER']}><CashierDashboard /></ProtectedRoute>} />
          <Route path="cashier-billing" element={<ProtectedRoute allowedRoles={['CASHIER', 'OWNER']}><CashierBilling /></ProtectedRoute>} />
          <Route path="cashier-payments" element={<ProtectedRoute allowedRoles={['CASHIER', 'OWNER']}><CashierPayments /></ProtectedRoute>} />
          <Route path="cashier-transactions" element={<ProtectedRoute allowedRoles={['CASHIER', 'OWNER']}><CashierTransactions /></ProtectedRoute>} />

          {/* Finance Routes */}
          <Route path="expenses" element={<ProtectedRoute allowedRoles={['OWNER']}><ExpenseManagement /></ProtectedRoute>} />
          <Route path="invoices" element={<ProtectedRoute allowedRoles={['OWNER']}><SupplierInvoices /></ProtectedRoute>} />
          
          {/* Reports Routes */}
          <Route path="reports" element={<ProtectedRoute allowedRoles={['OWNER']}><ReportsAnalytics /></ProtectedRoute>} />
          <Route path="daily-reports" element={<ProtectedRoute allowedRoles={['MANAGER']}><DailyReports /></ProtectedRoute>} />

          {/* System Routes */}
          <Route path="profile" element={<ProtectedRoute allowedRoles={ALL_ROLES}><ProfileSettings /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute allowedRoles={BACK_OFFICE}><Preferences /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
