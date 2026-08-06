import React, { useState, useEffect } from 'react';
import { 
  Users, Utensils, AlertTriangle, Clock, Activity, 
  ShoppingCart, Package, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Manager');

  const [metrics, setMetrics] = useState({
    activeOrders: 0,
    avgWaitTime: '0 mins',
    staffPresent: 0,
    staffTotal: 0,
    tablesOccupied: 0,
    tablesTotal: 0,
    lowStockItems: 0,
    staffList: [],
    alerts: []
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.name) setUserName(user.name);
    }

    const fetchMetrics = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/manager/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error('Failed to fetch manager dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="page-container" style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto', background: 'transparent', minHeight: '100vh', color: '#f8fafc' }}>
      
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', color: '#f8fafc', margin: '0 0 8px 0', fontWeight: 'bold' }}>
          Operations Dashboard
        </h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '1rem' }}>
          Welcome back, {userName}. Here is what's happening in your restaurant today.
        </p>
      </div>

      {/* Top Quick Status Banner */}
      <div style={{ background: '#161922', borderRadius: '16px', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', border: '1px solid #1f2330' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: metrics.alerts?.length > 0 ? '#450a0a' : metrics.activeOrders > 10 ? '#451a03' : '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={32} color={metrics.alerts?.length > 0 ? '#ef4444' : metrics.activeOrders > 10 ? '#f59e0b' : '#34d399'} />
          </div>
          <div>
            <div style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '4px' }}>Restaurant Status</div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.75rem', fontWeight: 600, color: metrics.alerts?.length > 0 ? '#ef4444' : metrics.activeOrders > 10 ? '#f59e0b' : '#22c55e' }}>
              {metrics.alerts?.length > 0 ? 'Attention Needed' : metrics.activeOrders > 10 ? 'High Volume' : 'Running Smoothly'}
            </h2>
            <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
              {metrics.alerts?.length > 0 ? `${metrics.alerts.length} pending alerts require action` : metrics.activeOrders > 10 ? 'Kitchen is currently experiencing high order volume' : 'Kitchen operations normal • All systems active'}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '4px' }}>Current Time</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc' }}>
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Core Operational Metrics */}
      <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        
        {/* Orders Widget */}
        <div style={{ background: '#161922', borderRadius: '16px', padding: '24px', border: '1px solid #1f2330' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ background: '#3b82f620', color: '#3b82f6', padding: '12px', borderRadius: '12px' }}>
              <ShoppingCart size={24} />
            </div>
            <span style={{ background: '#10b98120', color: '#10b981', padding: '4px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>Live</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{metrics.activeOrders}</div>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 500 }}>Active Orders</div>
        </div>

        {/* Kitchen Wait Time */}
        <div style={{ background: '#161922', borderRadius: '16px', padding: '24px', border: '1px solid #1f2330' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ background: '#f59e0b20', color: '#f59e0b', padding: '12px', borderRadius: '12px' }}>
              <Clock size={24} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{metrics.avgWaitTime}</div>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 500 }}>Avg Kitchen Wait Time</div>
        </div>

        {/* Tables Occupancy */}
        <div style={{ background: '#161922', borderRadius: '16px', padding: '24px', border: '1px solid #1f2330' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ background: '#a855f720', color: '#a855f7', padding: '12px', borderRadius: '12px' }}>
              <Utensils size={24} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{metrics.tablesOccupied} / {metrics.tablesTotal}</div>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 500 }}>Tables Occupied</div>
        </div>

        {/* Stock Alerts */}
        <div style={{ background: '#161922', borderRadius: '16px', padding: '24px', border: '1px solid #1f2330' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ background: '#ef444420', color: '#ef4444', padding: '12px', borderRadius: '12px' }}>
              <AlertTriangle size={24} />
            </div>
            {metrics.lowStockItems > 0 && <span style={{ background: '#ef444420', color: '#ef4444', padding: '4px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>Action Needed</span>}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>{metrics.lowStockItems}</div>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 500 }}>Low Stock Items</div>
        </div>

      </div>

      {/* Main Sections */}
      <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Staff & Operations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2330', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#b48600" /> Shift Attendance
              </h3>
              <a href="staff" style={{ fontSize: '0.875rem', color: '#b48600', textDecoration: 'none', fontWeight: 500 }}>View Roster</a>
            </div>
            <div style={{ padding: '24px' }}>
              {metrics.staffList?.length > 0 ? metrics.staffList.map((staff: any, index: number) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: staff.statusColor === 'red' ? '#450a0a20' : '#0f1219', border: staff.statusColor === 'red' ? '1px solid #7f1d1d' : 'none', borderRadius: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1f2330' }}>
                      <img src={`https://ui-avatars.com/api/?name=${staff.name}&background=random&color=fff`} style={{width:'100%', height:'100%', borderRadius:'50%'}} alt="" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{staff.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{staff.role}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      color: staff.statusColor === 'red' ? '#ef4444' : staff.statusColor === 'green' ? '#10b981' : staff.statusColor === 'yellow' ? '#f59e0b' : '#9ca3af', 
                      background: staff.statusColor === 'red' ? '#ef444420' : staff.statusColor === 'green' ? '#10b98120' : staff.statusColor === 'yellow' ? '#f59e0b20' : '#1f2937', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600 
                    }}>
                      {staff.status}
                    </span>
                    {staff.statusColor === 'red' && (
                      <button style={{ border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Re-assign</button>
                    )}
                  </div>
                </div>
              )) : (
                <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No active staff found.</div>
              )}
            </div>
          </div>
          
        </div>

        {/* Right Column: Alerts & Requests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2330', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="#ef4444" /> Action Required
              </h3>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {metrics.alerts?.length > 0 ? metrics.alerts.map((alert: any, index: number) => (
                <div key={index}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ background: '#ef444420', padding: '10px', borderRadius: '10px', color: '#ef4444' }}>
                      {alert.type === 'LOW_STOCK' ? <Package size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>{alert.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '2px' }}>{alert.description}</div>
                      <a href={alert.actionLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#b48600', marginTop: '8px', textDecoration: 'none', fontWeight: 500 }}>
                        {alert.actionText} <ChevronRight size={14} />
                      </a>
                    </div>
                  </div>
                  {index < metrics.alerts.length - 1 && <div style={{ height: '1px', background: '#1f2330', margin: '16px 0' }}></div>}
                </div>
              )) : (
                <div style={{ color: '#9ca3af', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10b981" /> All systems normal. No pending alerts.
                </div>
              )}

            </div>
          </div>
          
        </div>

      </div>

    </div>
  );
}
