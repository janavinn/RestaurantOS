import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Truck, Plus, Upload, Search, Filter, MoreVertical, 
  Eye, BarChart2, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight,
  Users, Package, FileText, Receipt, X
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', type: 'General', contact: '', phone: '', email: '', purchases: '', paidAmount: '' });

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const [resSuppliers, resActivities] = await Promise.all([
        fetch((import.meta.env.VITE_API_URL || '') + '/api/suppliers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch((import.meta.env.VITE_API_URL || '') + '/api/dashboard/activities', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (resSuppliers.ok) {
        setSuppliers(await resSuppliers.json());
      }
      if (resActivities.ok) {
        setActivities(await resActivities.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSuppliers();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/suppliers/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchSuppliers();
      setActiveMenu(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const purchases = parseFloat(newSupplier.purchases) || 0;
      const paid = parseFloat(newSupplier.paidAmount) || 0;
      const payables = purchases - paid;
      
      const payload = {
        ...newSupplier,
        purchases,
        payables
      };

      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewSupplier({ name: '', type: 'General', contact: '', phone: '', email: '', purchases: '', paidAmount: '' });
        fetchSuppliers();
      } else {
        alert('Failed to add supplier');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Active': return { bg: '#dcfce7', color: '#15803d' };
      case 'Overdue': return { bg: '#ffe4e6', color: '#e11d48' };
      case 'Paid': return { bg: '#e0e7ff', color: '#b48600' };
      default: return { bg: '#f1f5f9', color: '#cbd5e1' };
    }
  };

  // Dynamically calculate metrics based on fetched suppliers
  const { totalPurchases, totalPayables, topSuppliers, invoicesData, metricsData } = useMemo(() => {
    let purchases = 0;
    let payables = 0;
    let paidCount = 0;
    let activeCount = 0;
    let overdueCount = 0;

    const sorted = [...suppliers].sort((a, b) => (b.purchases || 0) - (a.purchases || 0));
    const top = sorted.slice(0, 5).map((s, idx) => ({
      rank: idx + 1,
      name: s.name,
      amount: `₹ ${(s.purchases || 0).toLocaleString('en-IN')}`
    }));

    suppliers.forEach(s => {
      purchases += (s.purchases || 0);
      payables += (s.payables || 0);
      if (s.status === 'Paid') paidCount++;
      if (s.status === 'Active') activeCount++;
      if (s.status === 'Overdue') overdueCount++;
    });

    const invData = [
      { name: 'Paid', value: paidCount, color: '#22c55e' },
      { name: 'Active', value: activeCount, color: '#3b82f6' },
      { name: 'Overdue', value: overdueCount, color: '#f59e0b' },
    ];

    const metrics = [
      { id: 1, title: 'Total Suppliers', value: suppliers.length.toString(), desc: 'Total registered', trend: '', isUp: true, color: '#b48600', bg: '#f3e8ff', spark: [10, 15, 12, 18, 20, 24] },
      { id: 2, title: 'Total Purchases', value: `₹ ${purchases.toLocaleString('en-IN')}`, desc: 'Lifetime purchases', trend: '', isUp: true, color: '#059669', bg: '#d1fae5', spark: [40, 50, 45, 60, 55, 75] },
      { id: 3, title: 'Total Payables', value: `₹ ${payables.toLocaleString('en-IN')}`, desc: 'Across all suppliers', trend: '', isUp: false, color: '#d97706', bg: '#fef3c7', spark: [30, 28, 35, 25, 22, 20] },
      { id: 4, title: 'Overdue Suppliers', value: overdueCount.toString(), desc: 'Need attention', trend: '', isUp: false, color: '#e11d48', bg: '#ffe4e6', spark: [5, 4, 6, 7, 5, 8] },
    ];

    return { totalPurchases: purchases, totalPayables: payables, topSuppliers: top, invoicesData: invData, metricsData: metrics };
  }, [suppliers]);

  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: 'transparent', minHeight: '100vh' }}>
      
      {/* Breadcrumb & Header */}
      <div style={{ fontSize: '0.875rem', color: '#b48600', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#cbd5e1' }}>Supplier Management</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(180, 134, 0, 0.15)', color: '#b48600', padding: '12px', borderRadius: '12px' }}>
            <Truck size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>Supplier Management</h1>
            <p style={{ margin: 0, color: '#94a3b8' }}>Manage all your suppliers, track performance and payments in one place.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#131313', border: '1px solid #1f2330', padding: '10px 20px', borderRadius: '8px', color: '#b48600', fontWeight: 600, cursor: 'pointer' }}>
            <Upload size={16} /> Import Suppliers
          </button>
          <button onClick={() => setIsAddModalOpen(true)} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#5b21b6', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={16} /> Add New Supplier
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {metricsData.map(metric => (
          <div key={metric.id} style={{ background: '#131313', borderRadius: '12px', border: '1px solid #1f2330', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: metric.bg, color: metric.color, padding: '12px', borderRadius: '12px' }}>
                {metric.id === 1 ? <Users size={20} /> : metric.id === 2 ? <Package size={20} /> : metric.id === 3 ? <FileText size={20} /> : <AlertCircle size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>{metric.title}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>{metric.value}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{metric.desc}</div>
                {metric.trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', marginTop: '8px', color: metric.isUp ? '#15803d' : '#e11d48', fontWeight: 600 }}>
                  {metric.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {metric.trend}
                </div>
                )}
              </div>
            </div>
            {/* Sparkline */}
            <div style={{ width: '100%', height: '40px', padding: '0 12px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metric.spark.map((v, i) => ({ name: i, value: v }))}>
                  <Line type="monotone" dataKey="value" stroke={metric.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-Column Layout */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: Data Table */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          
          <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                <select style={{ padding: '10px 16px', border: '1px solid #1f2330', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.875rem', outline: 'none', background: '#131313', minWidth: '150px' }}>
                  <option>All Suppliers</option>
                  <option>Active</option>
                  <option>Overdue</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#131313', border: '1px solid #1f2330', borderRadius: '8px', padding: '0 16px', flex: 1, maxWidth: '300px' }}>
                  <Search size={16} color="#94a3b8" />
                  <input type="text" placeholder="Search supplier..." style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 0', fontSize: '0.875rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 20px', border: '1px solid #1f2330', background: '#131313', borderRadius: '8px', color: '#cbd5e1', fontWeight: 500, cursor: 'pointer' }}>
                  <Filter size={16} /> Filter
                </button>
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', border: '1px solid #1f2330', background: '#131313', borderRadius: '8px', color: '#cbd5e1', cursor: 'pointer' }}>
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1f2330' }}>
                    <th style={{ padding: '16px 0', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Supplier Name</th>
                    <th style={{ padding: '16px 0', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Contact Person</th>
                    <th style={{ padding: '16px 0', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Phone</th>
                    <th style={{ padding: '16px 0', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '16px 0', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Total Purchases</th>
                    <th style={{ padding: '16px 0', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Payables</th>
                    <th style={{ padding: '16px 0', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '16px 0', color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
                  ) : suppliers.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>No suppliers found.</td></tr>
                  ) : suppliers.map(s => {
                    const statusStyle = getStatusStyle(s.status);
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #1f2330' }}>
                        <td style={{ padding: '16px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #1f2330', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d', fontWeight: 'bold', fontSize: '10px', overflow: 'hidden' }}>
                              <img src={`https://ui-avatars.com/api/?name=${s.name.replace(/ /g, '+')}&background=random&color=fff`} style={{width:'100%', height:'100%'}} alt="" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.875rem' }}>{s.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.type}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                          <div>{s.contact || '-'}</div>
                        </td>
                        <td style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{s.phone || '-'}</td>
                        <td style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{s.email || '-'}</td>
                        <td style={{ fontSize: '0.875rem', color: '#f8fafc', fontWeight: 500 }}>₹ {(s.purchases || 0).toLocaleString('en-IN')}</td>
                        <td style={{ fontSize: '0.875rem', color: '#f8fafc', fontWeight: 500 }}>₹ {(s.payables || 0).toLocaleString('en-IN')}</td>
                        <td>
                          <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {s.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', position: 'relative' }}>
                            <button style={{ background: '#131313', border: '1px solid #1f2330', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer' }}>
                              <Eye size={14} />
                            </button>
                            <button onClick={() => setActiveMenu(activeMenu === s.id ? null : s.id)} style={{ background: '#131313', border: '1px solid #1f2330', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer' }}>
                              <MoreVertical size={14} />
                            </button>
                            {activeMenu === s.id && (
                              <div style={{ position: 'absolute', top: '30px', right: '0', background: '#131313', border: '1px solid #1f2330', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, width: '120px', padding: '8px 0' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', padding: '4px 12px', textTransform: 'uppercase' }}>Set Status</div>
                                <button onClick={() => updateStatus(s.id, 'Active')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', fontSize: '0.875rem', color: '#f8fafc', cursor: 'pointer' }}>Active</button>
                                <button onClick={() => updateStatus(s.id, 'Paid')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', fontSize: '0.875rem', color: '#f8fafc', cursor: 'pointer' }}>Paid</button>
                                <button onClick={() => updateStatus(s.id, 'Overdue')} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', fontSize: '0.875rem', color: '#ef4444', cursor: 'pointer' }}>Overdue</button>
                              </div>
                            )}
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

        {/* RIGHT COLUMN: Widgets */}
        <div style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Supplier Status Overview */}
          <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#f8fafc', fontSize: '1rem' }}>Status Overview</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: '140px', height: '140px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={invoicesData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="none" dataKey="value">
                      {invoicesData.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{suppliers.length}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div> Paid <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{invoicesData.find(d=>d.name==='Paid')?.value || 0}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div> Active <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{invoicesData.find(d=>d.name==='Active')?.value || 0}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div> Overdue <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{invoicesData.find(d=>d.name==='Overdue')?.value || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Suppliers */}
          <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>Top Suppliers by Purchases</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topSuppliers.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>No suppliers found</div>
              ) : topSuppliers.map(s => (
                <div key={s.rank} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: s.rank <= 3 ? '#f3e8ff' : '#f1f5f9', color: s.rank <= 3 ? '#7e22ce' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                      {s.rank}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 500 }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 600 }}>{s.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>Recent Activities</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {activities.length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No recent activities.</div>
                ) : activities.slice(0, 5).map((act, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ background: act.type === 'purchase' ? 'rgba(180, 134, 0, 0.15)' : act.type === 'expense' ? '#dcfce7' : '#f1f5f9', color: act.type === 'purchase' ? '#b48600' : act.type === 'expense' ? '#15803d' : '#475569', padding: '10px', borderRadius: '50%' }}>
                      {act.type === 'purchase' ? <Truck size={18} /> : act.type === 'expense' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <div>
                      <div style={{ color: '#f8fafc', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>{act.title}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{new Date(act.time).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      </div>

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#131313', borderRadius: '16px', width: '100%', maxWidth: '500px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1f2330' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>Add New Supplier</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddSupplier}>
              <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Supplier Name</label>
                  <input type="text" required value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', outline: 'none' }} placeholder="e.g. FreshFoods Pvt Ltd" />
                </div>
                
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Category</label>
                  <select value={newSupplier.type} onChange={e => setNewSupplier({...newSupplier, type: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', outline: 'none' }}>
                    <option value="General">General</option>
                    <option value="Groceries & Vegetables">Groceries & Vegetables</option>
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Spices & Masalas">Spices & Masalas</option>
                    <option value="Dairy Products">Dairy Products</option>
                    <option value="Meat & Poultry">Meat & Poultry</option>
                    <option value="Packaging Materials">Packaging Materials</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Contact Person</label>
                  <input type="text" value={newSupplier.contact} onChange={e => setNewSupplier({...newSupplier, contact: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', outline: 'none' }} placeholder="e.g. Ravi Kumar" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Phone</label>
                    <input type="tel" value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', outline: 'none' }} placeholder="+91 98765 43210" />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Email</label>
                    <input type="email" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', outline: 'none' }} placeholder="ravi@freshfoods.com" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Total Bill Amount (₹)</label>
                    <input type="number" min="0" value={newSupplier.purchases} onChange={e => setNewSupplier({...newSupplier, purchases: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', outline: 'none' }} placeholder="0" />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Amount Paid (₹)</label>
                    <input type="number" min="0" value={newSupplier.paidAmount} onChange={e => setNewSupplier({...newSupplier, paidAmount: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', outline: 'none' }} placeholder="0" />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer" style={{ padding: '16px 24px', background: '#0a0a0a', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: '#131313', border: '1px solid #1f2330', fontWeight: 500, color: '#cbd5e1', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', background: '#b48600', border: 'none', fontWeight: 500, color: 'white', cursor: 'pointer' }}>Add Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
