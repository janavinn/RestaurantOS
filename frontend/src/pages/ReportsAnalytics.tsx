import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, LineChart as LineChartIcon, Download, Calendar, 
  IndianRupee, TrendingUp, TrendingDown, Percent
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export default function ReportsAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/reports/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <div style={{ padding: '32px', color: '#f8fafc' }}>Loading analytics...</div>;
  }

  const { metrics, revenueProfitData, categorySalesData } = data;

  const METRICS_UI = [
    { id: 1, title: 'Gross Revenue', value: `₹ ${metrics.grossRevenue.toLocaleString()}`, desc: 'MTD Sales', isUp: true, color: '#059669', bg: '#d1fae5' },
    { id: 2, title: 'Net Profit Margin', value: `${metrics.netProfitMargin.toFixed(1)}%`, desc: 'After all expenses', isUp: metrics.netProfitMargin > 0, color: '#c084fc', bg: 'rgba(126, 34, 206, 0.2)' },
    { id: 3, title: 'Food Cost (COGS)', value: `${metrics.foodCost.toFixed(1)}%`, desc: 'Target < 30%', isUp: metrics.foodCost < 30, color: '#2563eb', bg: '#dbeafe' },
    { id: 4, title: 'Labor Cost', value: `${metrics.laborCost.toFixed(1)}%`, desc: 'Target < 30%', isUp: metrics.laborCost < 30, color: '#e11d48', bg: '#ffe4e6' },
  ];

  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: 'transparent', minHeight: '100vh' }}>
      
      <div style={{ fontSize: '0.875rem', color: '#b48600', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#9ca3af' }}>Reports & Analytics</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(180, 134, 0, 0.15)', color: '#b48600', padding: '12px', borderRadius: '12px' }}>
            <LineChartIcon size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>Reports & Analytics</h1>
            <p style={{ margin: 0, color: '#9ca3af' }}>Executive dashboard for tracking revenue, profit margins, and prime costs.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#131313', border: '1px solid #1f2330', padding: '10px 16px', borderRadius: '8px', color: '#9ca3af', fontWeight: 500, cursor: 'pointer' }}>
            <Calendar size={16} /> This Month
          </button>
          <button style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#b48600', border: 'none', padding: '10px 20px', borderRadius: '8px', color: '#0a0a0a', fontWeight: 600, cursor: 'pointer' }}>
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {METRICS_UI.map(metric => (
          <div key={metric.id} style={{ background: '#131313', borderRadius: '12px', border: '1px solid #1f2330', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
            <div style={{ background: metric.bg, color: metric.color, padding: '12px', borderRadius: '12px' }}>
              {metric.id === 1 ? <IndianRupee size={20} /> : metric.id === 2 ? <TrendingUp size={20} /> : metric.id === 3 ? <Percent size={20} /> : <TrendingDown size={20} />}
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 500 }}>{metric.title}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>{metric.value}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: metric.isUp ? '#4ade80' : '#e11d48', fontWeight: 600, marginTop: '4px' }}>
                <span style={{ color: '#94a3b8', fontWeight: 400 }}>{metric.desc}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Revenue vs Profit Chart */}
        <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)', padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', color: '#f8fafc', fontSize: '1.1rem' }}>Revenue vs. Net Profit (6 Months)</h3>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueProfitData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2330" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', background: '#0a0a0a', color: '#f8fafc', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                  formatter={(value: any) => [`₹ ${Number(value).toLocaleString()}`, '']}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#b48600" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories Bar Chart */}
        <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)', padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', color: '#f8fafc', fontSize: '1.1rem' }}>Sales by Category</h3>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySalesData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1f2330" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#f8fafc', fontWeight: 500 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', background: '#0a0a0a', color: '#f8fafc', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                  formatter={(value: any) => [`₹ ${Number(value).toLocaleString()}`, 'Sales']}
                />
                <Bar dataKey="sales" fill="#b48600" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
