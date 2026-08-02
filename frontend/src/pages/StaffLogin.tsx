import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Delete, Search, ChefHat, Utensils, ClipboardList, Wallet, Store, Shield, CheckCircle, Clock, BarChart2, Headphones, Lightbulb, Lock } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

const roleConfig: any = {
  'CHEF': { icon: <ChefHat size={32} />, color: '#ef4444', desc: 'Manage kitchen orders, recipes and preparation.' },
  'WAITER': { icon: <Utensils size={32} />, color: '#22c55e', desc: 'Take orders and serve customers.' },
  'MANAGER': { icon: <ClipboardList size={32} />, color: '#3b82f6', desc: 'Oversee operations, staff, inventory and reports.' },
  'STORE_KEEPER': { icon: <Store size={32} />, color: '#a855f7', desc: 'Handle inventory, stock in/out and supplies.' },
  'CASHIER': { icon: <Wallet size={32} />, color: '#ec4899', desc: 'Generate bills and manage payments.' },
  'OWNER': { icon: <Shield size={32} />, color: '#eab308', desc: 'Access business insights, finance and settings.' },
};

// Reusable Custom Logo Component to replace the ugly white background logo.png
const CustomLogo = ({ scale = 1 }: { scale?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', transform: `scale(${scale})`, transformOrigin: 'left center' }}>
    <div style={{ position: 'relative', width: '48px', height: '48px', border: '1px solid #fcd34d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ChefHat size={24} color="#fcd34d" style={{ position: 'absolute', top: '6px' }} />
      <Utensils size={16} color="#fcd34d" style={{ position: 'absolute', bottom: '8px', left: '10px' }} />
      <Utensils size={16} color="#fcd34d" style={{ position: 'absolute', bottom: '8px', right: '10px', transform: 'scaleX(-1)' }} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', color: '#fcd34d', fontSize: '1.75rem', lineHeight: 1 }}>Aarunya</div>
      <div style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem', lineHeight: 1, marginTop: '2px', letterSpacing: '0.5px' }}>RestaurantOS</div>
      <div style={{ color: '#fcd34d', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', marginTop: '4px' }}>Smart. Simple. Seamless.</div>
    </div>
  </div>
);

export default function StaffLogin() {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<StaffMember | null>(null);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch('/api/staff/public-list');
        if (res.ok) {
          const data = await res.json();
          setStaffList(data);
        }
      } catch (err) {
        console.error('Failed to fetch staff list', err);
      }
    };
    fetchStaff();
  }, []);

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));
  const handleClear = () => setPin('');

  useEffect(() => {
    if (pin.length === 4 && selectedUser) {
      handleLogin();
    }
  }, [pin]);

  const handleLogin = async () => {
    if (!selectedUser || pin.length !== 4) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, pin })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Incorrect PIN');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      const roleSlug = (data.user.role || 'owner').toLowerCase();
      const nameSlug = (data.user.name || 'user').toLowerCase().replace(/\s+/g, '-');

      const routeMap: any = {
        'CHEF': `/${roleSlug}/${nameSlug}/kitchen-orders`,
        'WAITER': `/${roleSlug}/${nameSlug}/tables`,
        'STORE_KEEPER': `/${roleSlug}/${nameSlug}/store-keeper`,
        'CASHIER': `/${roleSlug}/${nameSlug}/cashier-overview`
      };
      
      window.location.href = routeMap[data.user.role] || `/${roleSlug}/${nameSlug}/dashboard`;
    } catch (err: any) {
      setError(err.message);
      setPin(''); 
    } finally {
      setIsLoading(false);
    }
  };

  const defaultRoles = Object.keys(roleConfig);
  const uniqueRoles = Array.from(new Set([...defaultRoles, ...staffList.map(s => s.role)]));
  const filteredRoles = uniqueRoles.filter(role => role.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredStaff = staffList.filter(s => s.role === selectedRole && s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw',
      backgroundImage: 'url(/restaurant-bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'Inter, sans-serif',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,600&display=swap');
          
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

          @media (max-width: 1024px) {
            .main-container { flex-direction: column !important; height: auto !important; min-height: 100% !important; width: 100% !important; border-radius: 0 !important; border: none !important; margin: 0 !important; overflow: visible !important; }
            .right-panel { width: 100% !important; border-left: none !important; border-top: 1px solid #2a2a2a !important; padding: 48px 24px !important; }
            .grid-container { grid-template-columns: repeat(2, 1fr) !important; overflow-y: visible !important; }
            .header-row { flex-direction: column !important; align-items: flex-start !important; gap: 24px; }
            .search-container { width: 100% !important; }
            .footer-highlights { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 24px; padding: 24px !important; }
            .footer-divider { display: none !important; }
            .left-panel { padding: 32px 24px !important; overflow: visible !important; }
            .scroll-area { overflow-y: visible !important; max-height: none !important; }
          }
          @media (max-width: 768px) {
            .grid-container { grid-template-columns: 1fr !important; }
            .footer-highlights { display: flex !important; flex-direction: column !important; gap: 16px !important; }
          }
        `}
      </style>
      
      {/* Dark Overlay - much darker to match mockup */}
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 5, 5, 0.9)', backdropFilter: 'blur(10px)', zIndex: 0 }} />

      {/* Main Container */}
      <div className="main-container" style={{ 
        position: 'relative', 
        zIndex: 10, 
        margin: 0, 
        width: '100%', 
        maxWidth: 'none', 
        height: '100vh',
        display: 'flex',
        borderRadius: 0,
        overflow: 'hidden',
        backgroundColor: '#17171a',
        border: 'none'
      }}>
        
        {/* LEFT PANEL */}
        <div className="left-panel" style={{ flex: 1, padding: '48px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Logo Replacement */}
          <div style={{ marginBottom: '40px' }}>
            <CustomLogo />
          </div>
          
          {/* Header Row */}
          <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '4px', height: '48px', backgroundColor: '#fcd34d', borderRadius: '4px' }} />
              <div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#f9fafb', letterSpacing: '-0.5px' }}>Staff Login</h1>
                <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '0.95rem' }}>
                  {!selectedRole ? 'Select your department to begin your shift.' : 'Select your profile to authenticate.'}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="search-container" style={{ position: 'relative', width: '320px' }}>
              <Search size={18} color="#6b7280" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder={!selectedRole ? "Search department..." : "Search profile..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px 12px 44px', 
                  borderRadius: '24px', 
                  border: '1px solid #2a2a2a', 
                  backgroundColor: '#111111', 
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#fcd34d'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
              />
            </div>
          </div>

          {selectedRole && (
            <button 
              onClick={() => { setSelectedRole(null); setSelectedUser(null); setPin(''); setError(''); setSearchQuery(''); }}
              style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#d1d5db', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, padding: '8px 16px', borderRadius: '20px', marginBottom: '24px', width: 'fit-content' }}
            >
              ← Back to Departments
            </button>
          )}

          {/* Grid Area - EXACTLY 3 COLUMNS NO BORDERS */}
          <div className="scroll-area hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', marginBottom: '24px' }}>
            <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              
              {!selectedRole ? (
                filteredRoles.map(role => {
                  const conf = roleConfig[role] || { icon: <User size={32} />, color: '#6b7280', desc: 'Staff member.' };
                  return (
                    <div 
                      key={role}
                      onClick={() => { setSelectedRole(role); setSearchQuery(''); }}
                      style={{ 
                        backgroundColor: '#1f2125', // Lighter dark card background
                        borderBottom: `3px solid ${conf.color}`,
                        borderRadius: '12px', 
                        padding: '32px 20px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, background-color 0.2s',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2d32'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2125'}
                    >
                      {/* ALL ICONS ARE GOLD IN MOCKUP */}
                      <div style={{ color: '#fcd34d', marginBottom: '20px' }}>
                        {conf.icon}
                      </div>
                      <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 700, color: '#f9fafb', letterSpacing: '0.5px' }}>
                        {role.replace('_', ' ')}
                      </h3>
                      <p style={{ margin: '0 0 20px 0', fontSize: '0.8rem', color: '#9ca3af', lineHeight: 1.5, maxWidth: '85%' }}>
                        {conf.desc}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#fcd34d', border: '1px solid rgba(252, 211, 77, 0.3)', padding: '4px 12px', borderRadius: '12px', fontWeight: 600 }}>
                        {staffList.filter(s => s.role === role).length} Profile(s)
                      </span>
                    </div>
                  );
                })
              ) : (
                filteredStaff.map(staff => {
                  const isSelected = selectedUser?.id === staff.id;
                  const conf = roleConfig[staff.role] || { color: '#6b7280' };
                  return (
                    <div 
                      key={staff.id}
                      onClick={() => { setSelectedUser(staff); setPin(''); setError(''); }}
                      style={{ 
                        backgroundColor: isSelected ? 'rgba(252, 211, 77, 0.05)' : '#1f2125',
                        border: `1px solid ${isSelected ? '#fcd34d' : 'transparent'}`,
                        borderBottom: `3px solid ${conf.color}`,
                        borderRadius: '12px', 
                        padding: '24px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: isSelected ? '#fcd34d' : '#9ca3af' }}>
                        <User size={24} />
                      </div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600, color: isSelected ? '#f9fafb' : '#d1d5db', textAlign: 'center' }}>
                        {staff.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {staff.role.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Highlights - MATCH MOCKUP COLORS */}
          <div className="footer-highlights" style={{ backgroundColor: '#111111', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={22} color="#22c55e" />
              <div>
                <div style={{ color: '#f9fafb', fontSize: '0.85rem', fontWeight: 600 }}>Secure Access</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Role-based authentication</div>
              </div>
            </div>
            <div className="footer-divider" style={{ width: '1px', height: '32px', backgroundColor: '#2a2a2a' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={22} color="#60a5fa" />
              <div>
                <div style={{ color: '#f9fafb', fontSize: '0.85rem', fontWeight: 600 }}>Shift Ready</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Quick department login</div>
              </div>
            </div>
            <div className="footer-divider" style={{ width: '1px', height: '32px', backgroundColor: '#2a2a2a' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarChart2 size={22} color="#f59e0b" />
              <div>
                <div style={{ color: '#f9fafb', fontSize: '0.85rem', fontWeight: 600 }}>Real-time Sync</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Live data across modules</div>
              </div>
            </div>
            <div className="footer-divider" style={{ width: '1px', height: '32px', backgroundColor: '#2a2a2a' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Headphones size={22} color="#d946ef" />
              <div>
                <div style={{ color: '#f9fafb', fontSize: '0.85rem', fontWeight: 600 }}>24/7 Support</div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>We're here to help</div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel" style={{ width: '380px', backgroundColor: '#131518', borderLeft: '1px solid #2a2a2a', padding: '32px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          
          {/* Custom Logo in Right Panel */}
          <div style={{ marginBottom: '24px' }}>
            <CustomLogo scale={0.7} />
          </div>

          {selectedUser ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: `1px dashed #fcd34d`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <User size={32} color="#fcd34d" />
              </div>
              
              <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#f9fafb', fontWeight: 600 }}>{selectedUser.name}</h2>
              <p style={{ margin: '0 0 16px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Enter your 4-digit PIN</p>

              {/* PIN Dots */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{ 
                    width: '14px', 
                    height: '14px', 
                    borderRadius: '50%', 
                    backgroundColor: pin.length > i ? '#fcd34d' : 'transparent',
                    border: `2px solid ${pin.length > i ? '#fcd34d' : '#2a2a2a'}`,
                    transition: 'all 0.2s ease'
                  }} />
                ))}
              </div>

              {error && <div style={{ color: '#ef4444', marginBottom: '8px', fontSize: '0.85rem' }}>{error}</div>}

              {/* Numpad */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%', maxWidth: '240px', marginBottom: 'auto' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button 
                    key={num}
                    onClick={() => handlePinInput(num.toString())}
                    style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#1f2125', color: '#f9fafb', fontSize: '1.5rem', fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', justifySelf: 'center' }}
                  >
                    {num}
                  </button>
                ))}
                
                <button 
                  onClick={handleClear}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', justifySelf: 'center' }}
                >
                  Clear
                </button>
                
                <button 
                  onClick={() => handlePinInput('0')}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#1f2125', color: '#f9fafb', fontSize: '1.5rem', fontWeight: 500, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', justifySelf: 'center' }}
                >
                  0
                </button>

                <button 
                  onClick={handleDelete}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', justifySelf: 'center' }}
                >
                  <Delete size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1 }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '1px dashed #374151', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', marginTop: '24px' }}>
                <User size={32} color="#6b7280" />
              </div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#f9fafb', fontWeight: 600 }}>No Profile Selected</h2>
              <p style={{ margin: '0 0 32px 0', color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Select a department and profile from the left panel to log in.
              </p>

              <div style={{ backgroundColor: '#111111', padding: '16px', borderRadius: '12px', textAlign: 'left', width: '100%', marginBottom: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fcd34d', marginBottom: '8px', fontWeight: 600 }}>
                  <Lightbulb size={16} /> Quick Tip
                </div>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Make sure you select the correct department to access the right tools and data.
                </p>
              </div>
            </div>
          )}

          {/* Bottom Right Footer */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '0.75rem' }}>
              <Lock size={12} color="#fcd34d" /> Secure • Reliable • Efficient
            </div>
            <div style={{ color: '#4b5563', fontSize: '0.7rem' }}>
              Aarunya RestaurantOS v1.0.0
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
