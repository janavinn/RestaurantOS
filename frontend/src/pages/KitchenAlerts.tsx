import React, { useState, useEffect } from 'react';
import { Bell, AlertOctagon, AlertTriangle, Clock, Info, CheckCircle2 } from 'lucide-react';

interface Alert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  time: string;
  icon: any;
  color: string;
  bg: string;
}

export default function KitchenAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAndGenerateAlerts = async () => {
    try {
      const newAlerts: Alert[] = [];
      const token = localStorage.getItem('token');
      
      // 1. Check for delayed or special orders
      const orderRes = await fetch((import.meta.env.VITE_API_URL || '') + '/api/orders/active', { headers: { Authorization: `Bearer ${token}` } });
      if (orderRes.ok) {
        const orders = await orderRes.json();
        orders.forEach((order: any) => {
          // Check for delays (order older than 15 mins and still not READY)
          const orderAgeMinutes = (new Date().getTime() - new Date(order.createdAt).getTime()) / 60000;
          if (orderAgeMinutes > 15 && order.status !== 'READY') {
            newAlerts.push({
              id: `delay-${order.id}`,
              type: 'CRITICAL',
              title: `Delayed Order: #${order.orderNumber || order.id.substring(0,6)}`,
              message: `This order has been waiting for ${Math.round(orderAgeMinutes)} minutes! Please expedite.`,
              time: 'Just now',
              icon: AlertOctagon,
              color: '#ef4444',
              bg: '#ef444420'
            });
          }

          // Check for special instructions/allergies (mocking property check)
          if (order.notes && order.notes.toLowerCase().match(/(allergy|no peanut|gluten|vegan|extra spicy)/)) {
            newAlerts.push({
              id: `special-${order.id}`,
              type: 'INFO',
              title: `Special Request: #${order.orderNumber || order.id.substring(0,6)}`,
              message: `Attention required: ${order.notes}`,
              time: 'Recent',
              icon: Info,
              color: '#a855f7',
              bg: '#a855f720'
            });
          }
        });
      }

      // 2. Check for Low Stock
      const invRes = await fetch((import.meta.env.VITE_API_URL || '') + '/api/inventory', { headers: { Authorization: `Bearer ${token}` } });
      if (invRes.ok) {
        const inventory = await invRes.json();
        inventory.forEach((ing: any) => {
          if (ing.stockLevel <= ing.minStock) {
            newAlerts.push({
              id: `stock-${ing.id}`,
              type: 'WARNING',
              title: `Low Stock: ${ing.name}`,
              message: `Current stock (${ing.stockLevel} ${ing.unit}) is at or below the minimum required level.`,
              time: 'System',
              icon: AlertTriangle,
              color: '#f59e0b',
              bg: '#f59e0b20'
            });
          }
        });
      }

      // Sort alerts: CRITICAL first, then WARNING, then INFO
      const severityMap = { CRITICAL: 1, WARNING: 2, INFO: 3 };
      newAlerts.sort((a, b) => severityMap[a.type] - severityMap[b.type]);

      setAlerts(newAlerts);
    } catch (err) {
      console.error('Failed to generate alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndGenerateAlerts();
    const interval = setInterval(fetchAndGenerateAlerts, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div style={{ padding: '32px', background: '#0f1219', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#43210b', color: '#f97316', padding: '12px', borderRadius: '12px', position: 'relative' }}>
            <Bell size={28} />
            {alerts.length > 0 && (
              <div style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0f1219' }}>
                {alerts.length}
              </div>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>Notification Center</h1>
            <p style={{ margin: 0, color: '#9ca3af' }}>Automated real-time alerts for the kitchen floor.</p>
          </div>
        </div>
      </div>

      {/* Alert Feed */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>Scanning systems for alerts...</div>
        ) : alerts.length === 0 ? (
          <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', padding: '64px', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: '16px', opacity: 0.8 }} />
            <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: '0 0 8px 0' }}>All Clear!</h2>
            <p style={{ color: '#9ca3af', margin: 0 }}>There are no active alerts in the kitchen right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {alerts.map(alert => {
              const Icon = alert.icon;
              return (
                <div key={alert.id} style={{ 
                  background: '#161922', 
                  border: `1px solid ${alert.bg}`, 
                  borderLeft: `4px solid ${alert.color}`,
                  borderRadius: '12px', 
                  padding: '20px',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                }}>
                  <div style={{ background: alert.bg, color: alert.color, padding: '12px', borderRadius: '12px' }}>
                    <Icon size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>{alert.title}</h3>
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {alert.time}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 16px 0', color: '#d1d5db', lineHeight: 1.5 }}>{alert.message}</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => dismissAlert(alert.id)} style={{ background: 'transparent', border: `1px solid ${alert.color}50`, color: alert.color, padding: '6px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}>
                        Dismiss
                      </button>
                      {alert.type === 'WARNING' && (
                        <button onClick={() => window.location.href='/ingredients'} style={{ background: alert.color, border: 'none', color: '#0f1219', padding: '6px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                          View Inventory
                        </button>
                      )}
                      {alert.type === 'CRITICAL' && (
                        <button onClick={() => window.location.href='/kitchen-orders'} style={{ background: alert.color, border: 'none', color: 'white', padding: '6px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                          View KDS
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
