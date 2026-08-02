import { useState, useEffect } from 'react';
import { ChevronDown, Users, Package, Receipt, LineChart, ShoppingCart, Wallet, Loader2 } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [userName, setUserName] = useState('Owner');
  const [userRole, setUserRole] = useState('OWNER');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.name) setUserName(user.name);
      if (user.role) setUserRole(user.role);
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '16px' }}>
        <Loader2 size={48} className="animate-spin" color="#6366f1" />
        <p style={{ color: '#64748b' }}>Loading your restaurant analytics...</p>
      </div>
    );
  }

  if (!data) {
    return <div>Failed to load dashboard data.</div>;
  }

  const { metrics, sparklines, overview, pendingApprovals, recentActivities, salesData, topMenuItems } = data;

  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const isManagement = userRole === 'OWNER' || userRole === 'MANAGER';
  const isOwner = userRole === 'OWNER';

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>Welcome back, <b>{userName}</b> 👋</h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem', margin: 0 }}>Here's an overview of your restaurant business.</p>
      </div>

      {/* TOP METRICS */}
      {isManagement && (
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <div className="icon-box" style={{ background: '#e0e7ff', color: '#4f46e5' }}><Wallet size={20} /></div>
            <div className="metric-info">
              <span className="metric-label">Total Sales (This Month)</span>
              <span className="metric-value">₹ {metrics.sales.value.toLocaleString()}</span>
              {metrics.sales.value > 0 ? (
                <span className={`metric-trend ${metrics.sales.trend >= 0 ? 'positive' : 'negative'}`}>
                  {metrics.sales.trend >= 0 ? '▲' : '▼'} {Math.abs(metrics.sales.trend).toFixed(1)}% <span className="trend-text">vs last month</span>
                </span>
              ) : (
                <span className="metric-trend" style={{ color: '#64748b' }}>No data yet</span>
              )}
            </div>
          </div>
          <div className="sparkline">
            <ResponsiveContainer width="100%" height={40}>
              <RechartsLineChart data={sparklines.sales}>
                <Line type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={2} dot={false} isAnimationActive={false} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="icon-box" style={{ background: '#dcfce7', color: '#16a34a' }}><Package size={20} /></div>
            <div className="metric-info">
              <span className="metric-label">Total Purchases (This Month)</span>
              <span className="metric-value">₹ {metrics.purchases.value.toLocaleString()}</span>
              {metrics.purchases.value > 0 ? (
                <span className={`metric-trend ${metrics.purchases.trend >= 0 ? 'positive' : 'negative'}`}>
                  {metrics.purchases.trend >= 0 ? '▲' : '▼'} {Math.abs(metrics.purchases.trend).toFixed(1)}% <span className="trend-text">vs last month</span>
                </span>
              ) : (
                <span className="metric-trend" style={{ color: '#64748b' }}>No data yet</span>
              )}
            </div>
          </div>
          <div className="sparkline">
            <ResponsiveContainer width="100%" height={40}>
              <RechartsLineChart data={sparklines.purchases}>
                <Line type="monotone" dataKey="v" stroke="#16a34a" strokeWidth={2} dot={false} isAnimationActive={false} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {isOwner && (
        <div className="metric-card">
          <div className="metric-header">
            <div className="icon-box" style={{ background: '#ffedd5', color: '#ea580c' }}><Receipt size={20} /></div>
            <div className="metric-info">
              <span className="metric-label">Total Expenses (This Month)</span>
              <span className="metric-value">₹ {metrics.expenses.value.toLocaleString()}</span>
              {metrics.expenses.value > 0 ? (
                <span className={`metric-trend ${metrics.expenses.trend <= 0 ? 'positive' : 'negative'}`}>
                  {metrics.expenses.trend <= 0 ? '▲' : '▼'} {Math.abs(metrics.expenses.trend).toFixed(1)}% <span className="trend-text">vs last month</span>
                </span>
              ) : (
                <span className="metric-trend" style={{ color: '#64748b' }}>No data yet</span>
              )}
            </div>
          </div>
          <div className="sparkline">
            <ResponsiveContainer width="100%" height={40}>
              <RechartsLineChart data={sparklines.expenses}>
                <Line type="monotone" dataKey="v" stroke="#ea580c" strokeWidth={2} dot={false} isAnimationActive={false} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {isOwner && (
        <div className="metric-card">
          <div className="metric-header">
            <div className="icon-box" style={{ background: '#ffe4e6', color: '#e11d48' }}><LineChart size={20} /></div>
            <div className="metric-info">
              <span className="metric-label">Net Profit (This Month)</span>
              <span className="metric-value">₹ {metrics.profit.value.toLocaleString()}</span>
              {metrics.profit.value !== 0 ? (
                <span className={`metric-trend ${metrics.profit.trend >= 0 ? 'positive' : 'negative'}`}>
                  {metrics.profit.trend >= 0 ? '▲' : '▼'} {Math.abs(metrics.profit.trend).toFixed(1)}% <span className="trend-text">vs last month</span>
                </span>
              ) : (
                <span className="metric-trend" style={{ color: '#64748b' }}>No data yet</span>
              )}
            </div>
          </div>
          <div className="sparkline">
            <ResponsiveContainer width="100%" height={40}>
              <RechartsLineChart data={sparklines.profit}>
                <Line type="monotone" dataKey="v" stroke="#e11d48" strokeWidth={2} dot={false} isAnimationActive={false} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}
      </div>
      )}

      {/* MIDDLE ROW */}
      <div className="middle-row">
        {isManagement && (
        <div className="dashboard-card overview-card">
          <div className="card-header">
            <h3>Business Overview</h3>
            <select className="date-select" defaultValue="this_month">
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
          <div className="overview-grid">
            <div className="overview-item">
              <div className="o-icon" style={{background: '#f3e8ff', color: '#9333ea'}}><Package size={18}/></div>
              <div className="o-data">
                <span className="o-label">Total Orders</span>
                <span className="o-val">{overview.totalOrders.toLocaleString()}</span>
              </div>
            </div>
            <div className="overview-item">
              <div className="o-icon" style={{background: '#dcfce7', color: '#16a34a'}}><Receipt size={18}/></div>
              <div className="o-data">
                <span className="o-label">Average Order Value</span>
                <span className="o-val">₹ {Math.round(overview.avgOrderValue).toLocaleString()}</span>
              </div>
            </div>
            <div className="overview-item">
              <div className="o-icon" style={{background: '#ffe4e6', color: '#e11d48'}}><Package size={18}/></div>
              <div className="o-data">
                <span className="o-label">Active Orders</span>
                <span className="o-val">{overview.activeOrders}</span>
              </div>
            </div>
            <div className="overview-item">
              <div className="o-icon" style={{background: '#ffedd5', color: '#ea580c'}}><Receipt size={18}/></div>
              <div className="o-data">
                <span className="o-label">Completed Orders</span>
                <span className="o-val">{overview.completedOrders}</span>
              </div>
            </div>
          </div>
        </div>
        )}

        <div className="dashboard-card alerts-card" style={{ flex: isManagement ? '1' : '1 1 100%' }}>
          <div className="card-header">
            <h3>Pending Approvals (Staff Requests)</h3>
            <button className="btn-outline">View All</button>
          </div>
          <div className="alerts-list">
            {pendingApprovals.length > 0 ? pendingApprovals.map((item: any) => (
              <div className="alert-item" key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1f2330' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div className="alert-icon" style={{ background: '#3d2b07', color: '#f59e0b', padding: '8px', borderRadius: '8px' }}><Package size={16} /></div>
                  <div className="alert-info">
                    <span className="alert-name" style={{ display: 'block', fontWeight: 600, color: '#f8fafc', fontSize: '0.875rem' }}>{item.itemName}</span>
                    <span className="alert-qty" style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Qty: {item.quantity} (Req by: {item.requestedBy})</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={async () => {
                    const token = localStorage.getItem('token');
                    await fetch(`${import.meta.env.VITE_API_URL || ''}/api/purchase-requests/${item.id}`, {
                      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ status: 'OWNER_APPROVED' })
                    });
                    window.location.reload();
                  }} style={{ background: '#143d23', color: '#22c55e', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                  <button onClick={async () => {
                    const token = localStorage.getItem('token');
                    await fetch(`${import.meta.env.VITE_API_URL || ''}/api/purchase-requests/${item.id}`, {
                      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ status: 'REJECTED' })
                    });
                    window.location.reload();
                  }} style={{ background: '#3d1b1c', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                </div>
              </div>
            )) : <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No pending approvals!</p>}
          </div>
        </div>

        {isManagement && (
        <div className="dashboard-card activities-card">
          <div className="card-header">
            <h3>Recent Activities</h3>
            <button className="btn-outline">View All</button>
          </div>
          <div className="activity-list">
            {recentActivities.map((act: any) => (
              <div className="activity-item" key={act.id}>
                <div className={`activity-icon ${act.type === 'purchase' ? 'blue' : act.type === 'expense' ? 'red' : act.type === 'stock' ? 'green' : 'indigo'}`}>
                  {act.type === 'purchase' ? <ShoppingCart size={14}/> : act.type === 'expense' ? <Receipt size={14}/> : act.type === 'stock' ? <Package size={14}/> : <Users size={14}/>}
                </div>
                <div className="activity-info">
                  <span className="act-title">{act.title}</span>
                  <span className="act-time">{new Date(act.time).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* BOTTOM ROW */}
      {isManagement && (
      <div className="bottom-row">
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <h3>Sales Trend (Last 7 Days)</h3>
            <select className="date-select" defaultValue="this_week">
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
          <div className="chart-container" style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={salesData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value/1000}K`} />
                <Tooltip cursor={{stroke: '#e2e8f0', strokeWidth: 1}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: 'white', stroke: '#8b5cf6'}} activeDot={{r: 6}} isAnimationActive={false} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card top-menu-card">
          <div className="card-header">
            <h3>Top Selling Menu Items</h3>
            <select className="date-select" defaultValue="this_month">
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
          <table className="menu-table">
            <thead>
              <tr>
                <th>Menu Item</th>
                <th>Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topMenuItems.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="menu-name"><span className="menu-img">{item.img}</span> {item.name}</td>
                  <td>{item.sold}</td>
                  <td className="menu-revenue">{item.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
      
      <div className="dashboard-footer">
         © 2026 Aarunya Restaurant. All rights reserved. <span style={{float: 'right'}}>RestaurantOS v1.0.0</span>
      </div>
    </>
  );
}

