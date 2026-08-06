import { useState, useEffect } from 'react';
import { Receipt, Banknote, Clock, CheckCircle2 } from 'lucide-react';

export default function CashierDashboard() {
  const [stats, setStats] = useState({
    todayBills: 0,
    todayRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/orders/cashier-stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px', background: '#0a0a0a', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ margin: '0 0 32px 0', fontSize: '2rem', fontWeight: 700, color: '#f8fafc' }}>Cashier Dashboard</h1>
      
      <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <div style={{ background: '#131313', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#1e1b4b', color: '#818cf8', padding: '16px', borderRadius: '50%' }}>
            <Receipt size={32} />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Today's Bills</div>
            <div style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: 800 }}>{stats.todayBills}</div>
          </div>
        </div>
        
        <div style={{ background: '#131313', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#064e3b', color: '#34d399', padding: '16px', borderRadius: '50%' }}>
            <Banknote size={32} />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Today's Revenue</div>
            <div style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: 800 }}>₹{stats.todayRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: '#131313', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#422006', color: '#fbbf24', padding: '16px', borderRadius: '50%' }}>
            <Clock size={32} />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Pending Payments</div>
            <div style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: 800 }}>{stats.pendingPayments}</div>
          </div>
        </div>

        <div style={{ background: '#131313', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#1f2330', color: '#475569', padding: '16px', borderRadius: '50%' }}>
            <CheckCircle2 size={32} />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Completed Payments</div>
            <div style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: 800 }}>{stats.completedPayments}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
