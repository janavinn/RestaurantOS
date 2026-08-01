import React, { useState, useEffect } from 'react';
import { LineChart, Calendar, ShoppingBag, Users, Tags, AlertTriangle, TrendingUp, IndianRupee } from 'lucide-react';

interface ReportData {
  sales: { total: number; orderCount: number };
  orders: { total: number; completed: number; preparing: number; cancelled: number };
  staff: { total: number; present: number; absent: number; leave: number };
  tables: { total: number; occupied: number; available: number; reserved: number };
  inventoryAlerts: { name: string; stockLevel: number; unit: string }[];
  bestSelling: { name: string; orderCount: number }[];
}

export default function DailyReports() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/manager/daily-reports?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', margin: '0 0 8px 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LineChart size={28} color="#4f46e5" />
            Manager Reports
          </h1>
          <p style={{ margin: 0, color: '#94a3b8' }}>Daily overview of operations, staff, tables, and stock.</p>
        </div>

        {/* Date Selector */}
        <div style={{ display: 'flex', background: '#131313', borderRadius: '8px', border: '1px solid #1f2330', padding: '4px' }}>
          {(['today', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: period === p ? '#4f46e5' : 'transparent',
                color: period === p ? 'white' : '#475569',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {p === 'today' ? 'Today' : `This ${p}`}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8' }}>Loading reports...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          
          {/* Card 1: Today's Sales */}
          <div style={{ background: '#131313', padding: '24px', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(180, 134, 0, 0.15)', color: '#b48600', padding: '10px', borderRadius: '10px' }}>
                <IndianRupee size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{period === 'today' ? "Today's Sales" : 'Sales'}</h3>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              ₹{data.sales.total.toLocaleString('en-IN')}
            </div>
            <div style={{ color: '#94a3b8', fontWeight: 500 }}>
              {data.sales.orderCount} Orders
            </div>
          </div>

          {/* Card 2: Orders Report */}
          <div style={{ background: '#131313', padding: '24px', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '10px' }}>
                <ShoppingBag size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Orders Report</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #1f2330' }}>
                <span style={{ color: '#cbd5e1', fontWeight: 500 }}>Total Orders</span>
                <span style={{ fontWeight: 700 }}>{data.orders.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#15803d', fontWeight: 500 }}>Completed</span>
                <span style={{ fontWeight: 700 }}>{data.orders.completed}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#d97706', fontWeight: 500 }}>Preparing</span>
                <span style={{ fontWeight: 700 }}>{data.orders.preparing}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#b91c1c', fontWeight: 500 }}>Cancelled</span>
                <span style={{ fontWeight: 700 }}>{data.orders.cancelled}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Staff Attendance Report */}
          <div style={{ background: '#131313', padding: '24px', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#dcfce7', color: '#15803d', padding: '10px', borderRadius: '10px' }}>
                <Users size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Staff Attendance</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #1f2330' }}>
                <span style={{ color: '#cbd5e1', fontWeight: 500 }}>Total Staff</span>
                <span style={{ fontWeight: 700 }}>{data.staff.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#b48600', fontWeight: 500 }}>Present</span>
                <span style={{ fontWeight: 700 }}>{data.staff.present}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#b91c1c', fontWeight: 500 }}>Absent</span>
                <span style={{ fontWeight: 700 }}>{data.staff.absent}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#d97706', fontWeight: 500 }}>Leave</span>
                <span style={{ fontWeight: 700 }}>{data.staff.leave}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Table Occupancy Report */}
          <div style={{ background: '#131313', padding: '24px', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(180, 134, 0, 0.15)', color: '#b48600', padding: '10px', borderRadius: '10px' }}>
                <Tags size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Table Occupancy</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #1f2330' }}>
                <span style={{ color: '#cbd5e1', fontWeight: 500 }}>Total Tables</span>
                <span style={{ fontWeight: 700 }}>{data.tables.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#b91c1c', fontWeight: 500 }}>Occupied</span>
                <span style={{ fontWeight: 700 }}>{data.tables.occupied}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#15803d', fontWeight: 500 }}>Available</span>
                <span style={{ fontWeight: 700 }}>{data.tables.available}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#d97706', fontWeight: 500 }}>Reserved</span>
                <span style={{ fontWeight: 700 }}>{data.tables.reserved}</span>
              </div>
            </div>
          </div>

          {/* Card 5: Inventory Alert Report */}
          <div style={{ background: '#131313', padding: '24px', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '10px' }}>
                <AlertTriangle size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Inventory Alerts</h3>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '16px' }}>Low Stock Items</div>
            {data.inventoryAlerts.length === 0 ? (
              <div style={{ color: '#15803d', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                All inventory levels are good!
              </div>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.inventoryAlerts.map(alert => (
                  <li key={alert.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#0a0a0a', borderRadius: '8px', borderLeft: '4px solid #b91c1c' }}>
                    <span style={{ fontWeight: 600 }}>{alert.name}</span>
                    <span style={{ color: '#b91c1c', fontWeight: 700 }}>{alert.stockLevel} {alert.unit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Card 6: Best Selling Items */}
          <div style={{ background: '#131313', padding: '24px', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#cffafe', color: '#0891b2', padding: '10px', borderRadius: '10px' }}>
                <TrendingUp size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Best Selling Items</h3>
            </div>
            {data.bestSelling.length === 0 ? (
              <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>No sales data for this period.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.bestSelling.map((item, index) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#0a0a0a', borderRadius: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#d97706', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: '#cbd5e1', fontWeight: 500 }}>{item.orderCount} Orders</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
