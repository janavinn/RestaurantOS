import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import ChatWidget from './ChatWidget';
import { 
  Search, Bell, ChevronDown, LayoutDashboard, Users, UserCog, Truck, 
  Carrot, Menu as MenuIcon, BookOpen, Package, ShoppingCart, Tags, FileText, 
  ArrowRightLeft, Wallet, Receipt, LineChart, Settings, Sliders, CreditCard, Banknote,
  LogOut, ClipboardList, ChefHat, Leaf, Edit
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { urlRole, urlUsername } = useParams();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New order received (#1042)', time: '2m ago', unread: true },
    { id: 2, text: 'Inventory alert: Tomatoes low', time: '1h ago', unread: true },
    { id: 3, text: 'Purchase request approved', time: '2h ago', unread: false }
  ]);

  const basePath = `/${urlRole}/${urlUsername}`;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(urlRole?.toLowerCase() === 'owner' ? '/aarunya/owner/login' : '/aarunya/staff/login');
      return;
    }
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || 'Owner');
      setUserRole(user.role || 'OWNER');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate(urlRole?.toLowerCase() === 'owner' ? '/aarunya/owner/login' : '/aarunya/staff/login');
  };

  const ALL_ROLES = ['OWNER', 'MANAGER', 'CHEF', 'WAITER'];
  const BACK_OFFICE = ['OWNER', 'MANAGER'];

  const rawNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', section: 'main', allowedRoles: ['OWNER', 'MANAGER'] },
    
    { name: 'MANAGEMENT', section: 'header', allowedRoles: ['OWNER', 'MANAGER'] },
    { name: 'Staff Management', icon: Users, path: '/staff', section: 'main', allowedRoles: ['OWNER', 'MANAGER'] },
    { name: 'Roles & Permissions', icon: UserCog, path: '/roles', section: 'main', allowedRoles: ['OWNER'] },
    { name: 'Menu', icon: BookOpen, path: '/menu', section: 'main', allowedRoles: ['MANAGER'] },
    { name: 'Inventory', icon: Package, path: '/inventory', section: 'main', allowedRoles: ['MANAGER'] },
    { name: 'Purchase Requests', icon: ShoppingCart, path: '/purchase-requests', section: 'main', allowedRoles: ['MANAGER'] },
    { name: 'Tables', icon: Tags, path: '/table-admin', section: 'main', allowedRoles: [] },
    { name: 'Supplier Management', icon: Truck, path: '/suppliers', section: 'main', allowedRoles: ['OWNER'] },
    
    { name: 'FINANCE', section: 'header', allowedRoles: ['OWNER'] },
    { name: 'Expenses', icon: Wallet, path: '/expenses', section: 'main', allowedRoles: ['OWNER'] },
    { name: 'AI Invoice Processing', icon: FileText, path: '/invoices', section: 'main', allowedRoles: ['OWNER'] },
    { name: 'Reports', icon: LineChart, path: '/reports', section: 'main', allowedRoles: ['OWNER'] },
    
    { name: 'SYSTEM', section: 'header', allowedRoles: ['OWNER'] },
    { name: 'Settings', icon: Settings, path: '/settings', section: 'main', allowedRoles: ['OWNER'] },

    { name: 'STORE KEEPER', section: 'header', allowedRoles: ['STORE_KEEPER'] },
    { name: 'Inventory Portal', icon: Package, path: '/store-keeper', section: 'main', allowedRoles: ['STORE_KEEPER'] },

    { name: 'WAITER DASHBOARD', section: 'header', allowedRoles: ['WAITER'] },
    { name: 'Tables (Floor)', icon: LayoutDashboard, path: '/tables', section: 'main', allowedRoles: ['WAITER'] },
    { name: 'My Orders', icon: Receipt, path: '/my-orders', section: 'main', allowedRoles: ['WAITER'] },

    { name: 'CASHIER PORTAL', section: 'header', allowedRoles: ['CASHIER'] },
    { name: 'Dashboard', icon: LayoutDashboard, path: '/cashier-overview', section: 'main', allowedRoles: ['CASHIER'] },
    { name: 'Billing', icon: Receipt, path: '/cashier-billing', section: 'main', allowedRoles: ['CASHIER'] },
    { name: 'Payments', icon: CreditCard, path: '/cashier-payments', section: 'main', allowedRoles: ['CASHIER'] },
    { name: 'Transactions', icon: Banknote, path: '/cashier-transactions', section: 'main', allowedRoles: ['CASHIER'] },
  ];

  const filteredNav = rawNavItems.filter(item => {
    return item.allowedRoles.includes(userRole || 'OWNER');
  });

  const navItems = filteredNav.filter((item, index, array) => {
    if (item.section === 'header') {
      const nextItem = array[index + 1];
      if (!nextItem || nextItem.section === 'header') {
        return false;
      }
    }
    return true;
  });

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={['CHEF', 'WAITER', 'MANAGER'].includes(userRole) ? { backgroundColor: '#0a0a0a', color: '#f8fafc' } : {}}>
      {/* SIDEBAR */}
      <aside className="sidebar" style={['CHEF', 'WAITER', 'MANAGER'].includes(userRole) ? { backgroundColor: '#0a0a0a', borderRight: '1px solid #1f2330' } : {}}>
        <div className="sidebar-header" style={{ padding: '24px 20px', borderBottom: 'none', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
          {isSidebarOpen && !['CHEF', 'WAITER'].includes(userRole) && (
            <div style={{ background: '#ffffff', padding: '12px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.png" alt="Aarunya Logo" style={{ width: '100%', maxWidth: '120px', margin: '0', display: 'block', borderRadius: '4px' }} />
            </div>
          )}
          <button 
            className="btn-toggle-sidebar" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', color: 'white' }}
          >
            <MenuIcon size={24} />
          </button>
        </div>

        <div className="sidebar-scroll" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {userRole === 'CHEF' ? (
            /* EXACT CHEF SIDEBAR MOCKUP */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 16px' }}>
              
              {/* Profile Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 8px', borderBottom: '1px solid #1f2330', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ChefHat size={24} color="#1e293b" />
                </div>
                {isSidebarOpen && (
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>Chef</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      Kitchen Department <ChevronDown size={12} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div> Online
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Items */}
              <nav className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'Dashboard', icon: LayoutDashboard, path: '/kitchen-orders' },
                  { name: 'Recipes', icon: BookOpen, path: '/recipes' },
                  { name: 'Ingredients', icon: Leaf, path: '/ingredients' },
                  { name: 'Preparation List', icon: ClipboardList, path: '/prep-list' },
                  { name: 'Kitchen Alerts', icon: Bell, path: '/kitchen-alerts' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(`${basePath}${item.path}`);
                  return (
                    <div 
                      key={idx} 
                      title={!isSidebarOpen ? item.name : undefined}
                      onClick={() => item.path && navigate(`${basePath}${item.path}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        color: isActive ? '#f97316' : '#d1d5db',
                        background: isActive ? '#43210b' : 'transparent',
                        transition: 'all 0.2s',
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.9rem'
                      }}
                    >
                      <Icon size={20} color={isActive ? '#f97316' : '#9ca3af'} style={{ flexShrink: 0 }} />
                      {isSidebarOpen && <span>{item.name}</span>}
                    </div>
                  );
                })}
              </nav>

              {/* Log Out */}
              <div style={{ padding: '24px 8px', marginTop: 'auto' }}>
                <div 
                  onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/aarunya/staff/login'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#d1d5db', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, padding: '8px' }}
                >
                  <LogOut size={20} color="#9ca3af" />
                  <span>Log Out</span>
                </div>
              </div>
            </div>
          ) : userRole === 'WAITER' ? (
            /* WAITER SIDEBAR */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0 16px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 8px', borderBottom: '1px solid #1f2330', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src="/logo.png" alt="Logo" style={{ width: '100%', objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                  <ChefHat size={32} color="#f97316" style={{ position: 'absolute' }} />
                </div>
                {isSidebarOpen && (
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f97316', marginBottom: '2px', letterSpacing: '0.5px' }}>AARUNYA</div>
                    <div style={{ fontSize: '0.7rem', color: '#f8fafc', letterSpacing: '0.5px' }}>RESTAURANT OS</div>
                    <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600, marginTop: '2px' }}>WAITER PANEL</div>
                  </div>
                )}
              </div>

              <div 
                title="Dashboard"
                onClick={() => navigate(`${basePath}/tables`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                  color: location.pathname === `${basePath}/tables` ? '#f8fafc' : '#d1d5db',
                  background: location.pathname === `${basePath}/tables` ? '#f97316' : 'transparent',
                  fontWeight: location.pathname === `${basePath}/tables` ? 600 : 500,
                  fontSize: '0.9rem', marginBottom: '24px'
                }}
              >
                <LayoutDashboard size={20} color={location.pathname === `${basePath}/tables` ? 'white' : '#9ca3af'} style={{ flexShrink: 0 }} />
                {isSidebarOpen && <span>Dashboard</span>}
              </div>


              {isSidebarOpen && <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '1px', marginBottom: '12px', paddingLeft: '16px' }}>ORDERS</div>}
              <div 
                title="My Orders"
                onClick={() => navigate(`${basePath}/my-orders`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
                  color: location.pathname === `${basePath}/my-orders` ? '#f97316' : '#d1d5db',
                  background: location.pathname === `${basePath}/my-orders` ? '#43210b' : 'transparent',
                  fontWeight: location.pathname === `${basePath}/my-orders` ? 600 : 500, fontSize: '0.9rem', marginBottom: '8px'
                }}
              >
                <ClipboardList size={20} color={location.pathname === `${basePath}/my-orders` ? '#f97316' : '#9ca3af'} style={{ flexShrink: 0 }} />
                {isSidebarOpen && <span>My Orders</span>}
              </div>

              {/* Log Out */}
              <div style={{ padding: '24px 8px', marginTop: 'auto' }}>
                <div 
                  title="Log Out"
                  onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/aarunya/staff/login'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#d1d5db', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, padding: '8px' }}
                >
                  <LogOut size={20} color="#9ca3af" style={{ flexShrink: 0 }} />
                  {isSidebarOpen && <span>Log Out</span>}
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD SIDEBAR */
            <>
              <nav className="sidebar-nav">
                {navItems.map((item, index) => {
                  if (item.section === 'header') {
                    return <div key={index} className="nav-section">{item.name}</div>;
                  }
                  const Icon = item.icon;
                  const fullPath = item.path ? `${basePath}${item.path}` : '';
                  const isActive = location.pathname.startsWith(fullPath);
                  return (
                    <div 
                      key={index} 
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => fullPath && navigate(fullPath)}
                      title={!isSidebarOpen ? item.name : undefined}
                      style={
                        userRole === 'MANAGER'
                          ? {
                              color: isActive ? '#ffffff' : '#9ca3af',
                              backgroundColor: isActive ? '#3a2810' : 'transparent',
                              fontWeight: isActive ? 600 : 500,
                              borderRadius: '8px',
                              padding: '12px 16px'
                            }
                          : userRole === 'CHEF' && isActive
                          ? { backgroundColor: 'transparent', color: '#f59e0b', borderLeft: '3px solid #f59e0b', borderRadius: '0 8px 8px 0' }
                          : userRole === 'CHEF'
                          ? { color: '#9ca3af' }
                          : {}
                      }
                    >
                      {Icon && <Icon size={20} />}
                      <span>{item.name}</span>
                    </div>
                  );
                })}
              </nav>

              <div className="sidebar-footer">
                {userRole === 'OWNER' && (
                  <div className="plan-card">
                    <div className="plan-title">👑 Aarunya Owner Plan</div>
                    <div className="plan-status">Your plan is active <span className="status-dot"></span></div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content" style={['CHEF', 'WAITER', 'MANAGER', 'OWNER'].includes(userRole) ? { backgroundColor: '#0a0a0a', color: '#f8fafc' } : {}}>
        {/* HEADER */}
        {!['CHEF', 'WAITER'].includes(userRole) && (
          <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 32px' }}>
            <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div className="search-bar" style={{ width: '400px' }}>
                <input type="text" placeholder="Search anything..." style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none' }} />
                <Search size={18} color="#94a3b8" />
              </div>
            </div>
                        <div className="header-actions">
                <div className="notification-bell" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}>
                  <Bell size={20} color="#64748b" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="badge" style={{ background: '#7e22ce' }}>{notifications.filter(n => n.unread).length}</span>
                  )}
                  {showNotifications && (
                    <div style={{ position: 'absolute', top: '40px', right: '0', background: '#1e1e2d', border: '1px solid #1f2330', borderRadius: '12px', width: '320px', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1f2330', fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Notifications</span>
                        <span style={{ color: '#6366f1', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setNotifications(notifications.map(n => ({...n, unread: false}))); }}>Mark all read</span>
                      </div>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.map(n => (
                          <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #1f2330', background: n.unread ? 'rgba(99, 102, 241, 0.1)' : 'transparent', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontSize: '0.85rem', color: '#f8fafc' }}>{n.text}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{n.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="user-profile" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}>
                  <div className="avatar" style={{ background: '#3a2810', color: '#f59e0b', border: '1px solid #b48600' }}>{userName.substring(0, 2).toUpperCase() || 'JN'}</div>
                  <div className="user-info">
                    <span className="user-name">{userName || 'Janavi N N'}</span>
                    <span className="user-role">{userRole || 'Owner'}</span>
                  </div>
                  <ChevronDown size={16} color="#64748b" />
                  
                  {showProfileMenu && (
                    <div style={{ position: 'absolute', top: '50px', right: '0', background: '#1e1e2d', border: '1px solid #1f2330', borderRadius: '12px', width: '200px', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', overflow: 'hidden', textAlign: 'left' }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1f2330', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar" style={{ background: '#3a2810', color: '#f59e0b', border: '1px solid #b48600', width: '32px', height: '32px', fontSize: '0.8rem' }}>{userName.substring(0, 2).toUpperCase() || 'JN'}</div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{userName || 'User'}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{userRole}</div>
                        </div>
                      </div>
                      <div style={{ padding: '8px' }}>
                        <div onClick={(e) => { e.stopPropagation(); navigate('/settings'); }} style={{ padding: '10px 12px', borderRadius: '6px', fontSize: '0.85rem', color: '#d1d5db', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#2c2d3a'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          <Settings size={16} /> Settings
                        </div>
                        <div onClick={(e) => { e.stopPropagation(); handleLogout(); }} style={{ padding: '10px 12px', borderRadius: '6px', fontSize: '0.85rem', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', marginTop: '4px' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          <LogOut size={16} /> Log out
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
          </header>
        )}

        {/* DASHBOARD BODY */}
        <div className="dashboard-body" style={['CHEF', 'WAITER'].includes(userRole) ? { padding: '32px 40px' } : { padding: 0 }}>
          <Outlet />
        </div>
      </main>

      {/* RENDER CHAT WIDGET ONLY FOR MANAGEMENT */}
      {['OWNER', 'MANAGER'].includes(userRole) && <ChatWidget />}
    </div>
  );
}
