import React from 'react';
import { 
  LayoutDashboard, ShoppingCart, Plus, Upload, Search, Filter, MoreVertical, 
  Eye, PackageSearch, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight,
  TrendingUp, Database
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

const METRICS_DATA = [
  { id: 1, title: 'Total SKUs', value: '1,248', desc: 'Registered products', trend: '+ 15 this month', isUp: true, color: '#7e22ce', bg: '#f3e8ff', spark: [1200, 1210, 1225, 1230, 1240, 1248] },
  { id: 2, title: 'Active Products', value: '1,180', desc: 'Currently in use', trend: '+ 2% vs last month', isUp: true, color: '#059669', bg: '#d1fae5', spark: [1150, 1160, 1165, 1170, 1175, 1180] },
  { id: 3, title: 'Out of Stock', value: '24', desc: 'Zero quantity on hand', trend: '+ 5 vs last week', isUp: false, color: '#e11d48', bg: '#ffe4e6', spark: [15, 16, 18, 20, 19, 24] },
  { id: 4, title: 'New Items', value: '42', desc: 'Added last 30 days', trend: 'Consistent addition', isUp: true, color: '#2563eb', bg: '#dbeafe', spark: [30, 32, 35, 38, 40, 42] },
];

const PRODUCTS = [
  { id: 'SKU-1001', name: 'Almond Milk (Unsweetened)', category: 'Dairy Alternatives', location: 'Bin A-12', minStock: 20, onHand: 45, status: 'Active' },
  { id: 'SKU-1002', name: 'Sriracha Sauce (Large)', category: 'Pantry', location: 'Bin C-05', minStock: 10, onHand: 8, status: 'Low Stock' },
  { id: 'SKU-1003', name: 'Organic Quinoa', category: 'Dry Goods', location: 'Bin B-02', minStock: 50, onHand: 120, status: 'Active' },
  { id: 'SKU-1004', name: 'Truffle Salt', category: 'Spices', location: 'Bin D-01', minStock: 5, onHand: 0, status: 'Out of Stock' },
  { id: 'SKU-1005', name: 'Heavy Cream', category: 'Dairy', location: 'Fridge 1', minStock: 15, onHand: 22, status: 'Active' },
  { id: 'SKU-1006', name: 'Cardamom Pods', category: 'Spices', location: 'Bin D-04', minStock: 2, onHand: 5, status: 'Active' },
];

export default function ProductManagement() {
  
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Active': return { bg: '#dcfce7', color: '#15803d' };
      case 'Low Stock': return { bg: '#fef3c7', color: '#b45309' };
      case 'Out of Stock': return { bg: '#ffe4e6', color: '#e11d48' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: '#fafafa', minHeight: '100vh' }}>
      
      <div style={{ fontSize: '0.875rem', color: '#6366f1', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#475569' }}>Product Management</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '12px', borderRadius: '12px' }}>
            <Database size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#0f172a', margin: '0 0 4px 0', fontWeight: 'bold' }}>Product Management</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Manage your entire product catalog, SKUs, and bin locations.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '8px', color: '#6366f1', fontWeight: 600, cursor: 'pointer' }}>
            <Upload size={16} /> Import SKUs
          </button>
          <button style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#5b21b6', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {METRICS_DATA.map(metric => (
          <div key={metric.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: metric.bg, color: metric.color, padding: '12px', borderRadius: '12px' }}>
                <PackageSearch size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>{metric.title}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>{metric.value}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{metric.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 16px', flex: 1, maxWidth: '400px' }}>
              <Search size={16} color="#94a3b8" />
              <input type="text" placeholder="Search by SKU or Name..." style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 0', fontSize: '0.875rem' }} />
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
                <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>SKU</th>
                <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Product Name</th>
                <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Bin Location</th>
                <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Min Stock</th>
                <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>On Hand</th>
                <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '16px 0', color: '#0f172a', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map(item => {
                const statusStyle = getStatusStyle(item.status);
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 0', fontSize: '0.85rem', color: '#475569', fontWeight: 600, fontFamily: 'monospace' }}>{item.id}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{item.name}</td>
                    <td style={{ fontSize: '0.875rem', color: '#475569' }}>{item.category}</td>
                    <td style={{ fontSize: '0.875rem', color: '#6366f1', fontWeight: 500 }}>{item.location}</td>
                    <td style={{ fontSize: '0.875rem', color: '#475569' }}>{item.minStock}</td>
                    <td style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 700 }}>
                      <span style={{ color: item.onHand <= item.minStock ? '#e11d48' : '#15803d' }}>{item.onHand}</span>
                    </td>
                    <td>
                      <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                          <Eye size={14} />
                        </button>
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
  );
}
