import React from 'react';
import { 
  LayoutDashboard, FileText, Plus, Search, Filter, MoreVertical, 
  Printer, CheckCircle2, Clock, Truck, AlertCircle, TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

const METRICS_DATA = [
  { id: 1, title: 'Total POs (Month)', value: '45', desc: 'Issued this month', icon: FileText, color: '#7e22ce', bg: '#f3e8ff' },
  { id: 2, title: 'Pending Delivery', value: '12', desc: 'Awaiting arrival', icon: Truck, color: '#059669', bg: '#d1fae5' },
  { id: 3, title: 'Total Spend', value: '₹ 12.4L', desc: 'Committed capital', icon: TrendingUp, color: '#2563eb', bg: '#dbeafe' },
  { id: 4, title: 'Overdue POs', value: '3', desc: 'Requires follow up', icon: AlertCircle, color: '#e11d48', bg: '#ffe4e6' },
];

const PO_DATA = [
  { id: 'PO-2023-089', supplier: 'FreshFarm Produce', date: 'Oct 24, 2023', amount: '₹ 45,000', status: 'Received' },
  { id: 'PO-2023-090', supplier: 'Ocean Catch Seafood', date: 'Oct 25, 2023', amount: '₹ 1,20,000', status: 'Sent' },
  { id: 'PO-2023-091', supplier: 'Gourmet Imports', date: 'Oct 25, 2023', amount: '₹ 85,500', status: 'Partial' },
  { id: 'PO-2023-092', supplier: 'Dairy Best Co.', date: 'Oct 26, 2023', amount: '₹ 32,000', status: 'Draft' },
  { id: 'PO-2023-093', supplier: 'Spice Route Ltd', date: 'Oct 26, 2023', amount: '₹ 15,200', status: 'Overdue' },
];

const SPEND_DATA = [
  { name: 'Week 1', spend: 400000 },
  { name: 'Week 2', spend: 300000 },
  { name: 'Week 3', spend: 500000 },
  { name: 'Week 4', spend: 200000 },
];

export default function PurchaseOrders() {

  const [userRole, setUserRole] = React.useState('OWNER');

  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserRole(user.role || 'OWNER');
    }
  }, []);

  const isOwner = userRole === 'OWNER';

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Approved': return { bg: '#dcfce7', color: '#15803d', icon: CheckCircle2 };
      case 'Pending': return { bg: '#fef3c7', color: '#b45309', icon: Clock };
      case 'Received': return { bg: '#dbeafe', color: '#2563eb', icon: Truck };
      case 'Draft': return { bg: '#f1f5f9', color: '#475569', icon: FileText };
      case 'Overdue': return { bg: '#ffe4e6', color: '#e11d48', icon: AlertCircle };
      default: return { bg: '#f1f5f9', color: '#475569', icon: FileText };
    }
  };

  const MOCK_POS = [
    { id: 'PO-2023-089', supplier: 'FreshFarm Produce', date: 'Oct 24, 2023', amount: '₹ 45,000', status: 'Received' },
    { id: 'PO-2023-090', supplier: 'Ocean Catch Seafood', date: 'Oct 25, 2023', amount: '₹ 1,20,000', status: 'Pending' },
    { id: 'PO-2023-091', supplier: 'Gourmet Imports', date: 'Oct 25, 2023', amount: '₹ 85,500', status: 'Pending' },
    { id: 'PO-2023-092', supplier: 'Dairy Best Co.', date: 'Oct 26, 2023', amount: '₹ 32,000', status: 'Approved' },
  ];

  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: '#fafafa', minHeight: '100vh' }}>
      
      <div style={{ fontSize: '0.875rem', color: '#6366f1', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#475569' }}>Purchase Requests</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '12px', borderRadius: '12px' }}>
            <FileText size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#0f172a', margin: '0 0 4px 0', fontWeight: 'bold' }}>{isOwner ? 'Purchase Orders' : 'Purchase Requests'}</h1>
            <p style={{ margin: 0, color: '#64748b' }}>{isOwner ? 'Manage supplier orders, track deliveries, and monitor procurement spend.' : 'Create purchase requests for low stock items for Owner approval.'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#5b21b6', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={16} /> {isOwner ? 'Create PO' : 'Create Request'}
          </button>
        </div>
      </div>

      <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {METRICS_DATA.map(metric => (
          <div key={metric.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ background: metric.bg, color: metric.color, padding: '12px', borderRadius: '12px' }}>
              <metric.icon size={20} />
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>{metric.title}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>{metric.value}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{metric.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* LEFT COLUMN: Table */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', flex: 1, maxWidth: '300px' }}>
                  <Search size={16} color="#94a3b8" />
                  <input type="text" placeholder="Search PO # or Supplier..." style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 0', fontSize: '0.875rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 20px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', color: '#475569', fontWeight: 500, cursor: 'pointer' }}>
                  <Filter size={16} /> Filter
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Request #</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Supplier</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Total Amount</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_POS.map(item => {
                    const statusStyle = getStatusStyle(item.status);
                    const StatusIcon = statusStyle.icon;
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 0', fontSize: '0.85rem', color: '#4f46e5', fontWeight: 600, fontFamily: 'monospace' }}>{item.id}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{item.supplier}</td>
                        <td style={{ fontSize: '0.875rem', color: '#475569' }}>{item.date}</td>
                        <td style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 600 }}>{item.amount}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: statusStyle.bg, color: statusStyle.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                            <StatusIcon size={12} /> {item.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {isOwner && item.status === 'Pending' && (
                              <button style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, color: '#166534', cursor: 'pointer' }} onClick={() => alert('Approved!')}>
                                Approve
                              </button>
                            )}
                            <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Chart */}
        <div style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#0f172a', fontSize: '1rem' }}>Monthly PO Spend</h3>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SPEND_DATA}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} formatter={(value) => `₹ ${value}`} />
                  <Bar dataKey="spend" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
