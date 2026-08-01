import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Receipt, Search, Filter, Download, MoreVertical, 
  IndianRupee, TrendingDown, AlertCircle, UploadCloud, X, CheckCircle2, ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SupplierInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // AI Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [parsedData, setParsedData] = useState({ supplier: '', date: '', total: 0, status: 'RECEIVED' });

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/purchase-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setInvoices(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('invoice', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/invoices/process', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        setParsedData(data);
        setAiModalOpen(true);
      } else {
        alert(data.error || 'Failed to process invoice');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while processing invoice');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/invoices/confirm', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(parsedData)
      });
      
      if (res.ok) {
        setAiModalOpen(false);
        fetchInvoices(); // Refresh the list
      } else {
        alert('Failed to save invoice');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/purchase-orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchInvoices();
        setOpenMenuId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/invoices/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Expense_Register.xlsx';
        a.click();
      } else {
        alert('Failed to export report');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during export');
    }
  };

  if (loading) {
    return <div style={{ padding: '32px', color: '#f8fafc' }}>Loading invoices...</div>;
  }

  // Calculate metrics
  const totalOutflow = invoices.filter(i => i.status === 'RECEIVED' || i.status === 'PAID').reduce((sum, i) => sum + i.total, 0);
  const pendingPayments = invoices.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + i.total, 0);
  const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE').length;

  const METRICS_DATA = [
    { id: 1, title: 'Total Outflow (MTD)', value: `₹ ${totalOutflow.toLocaleString()}`, trend: '', icon: IndianRupee, color: '#e11d48', bg: '#ffe4e6' },
    { id: 2, title: 'Pending Payments', value: `₹ ${pendingPayments.toLocaleString()}`, trend: `${invoices.filter(i => i.status === 'PENDING').length} Invoices`, icon: AlertCircle, color: '#f59e0b', bg: '#fef3c7' },
    { id: 3, title: 'Overdue Invoices', value: overdueInvoices.toString(), trend: 'Action Required', icon: TrendingDown, color: '#e11d48', bg: '#ffe4e6' }
  ];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'RECEIVED':
      case 'PAID': return { bg: '#143d23', color: '#22c55e', label: status };
      case 'OVERDUE': return { bg: '#3d1b1c', color: '#ef4444', label: 'Overdue' };
      case 'PENDING': return { bg: '#3d2b07', color: '#f59e0b', label: 'Pending' };
      default: return { bg: '#1f2330', color: '#cbd5e1', label: status };
    }
  };

  // Generate chart data by month
  const outflowMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    outflowMap[d.toLocaleString('default', { month: 'short' })] = 0;
  }
  
  invoices.forEach(i => {
    const mStr = new Date(i.date).toLocaleString('default', { month: 'short' });
    if (outflowMap[mStr] !== undefined && (i.status === 'RECEIVED' || i.status === 'PAID')) {
      outflowMap[mStr] += i.total;
    }
  });
  
  const outflowData = Object.entries(outflowMap).map(([month, amount]) => ({ month, amount }));

  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: 'transparent', minHeight: '100vh' }}>
      
      <div style={{ fontSize: '0.875rem', color: '#b48600', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#9ca3af' }}>AI Invoice Processing</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(180, 134, 0, 0.15)', color: '#b48600', padding: '12px', borderRadius: '12px' }}>
            <Receipt size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>AI Invoice Processing</h1>
            <p style={{ margin: 0, color: '#9ca3af' }}>Upload supplier bills to automatically extract details and log expenses.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#6366f1', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
          >
            {isProcessing ? (
              <span>Scanning Invoice...</span>
            ) : (
              <><UploadCloud size={16} /> Upload AI Invoice</>
            )}
          </button>
          
          <button onClick={handleExport} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#b48600', border: 'none', padding: '10px 20px', borderRadius: '8px', color: '#0a0a0a', fontWeight: 600, cursor: 'pointer' }}>
            <Download size={16} /> Export Expense Register
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {METRICS_DATA.map(metric => (
          <div key={metric.id} style={{ background: '#131313', borderRadius: '12px', border: '1px solid #1f2330', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
            <div style={{ background: metric.bg, color: metric.color, padding: '16px', borderRadius: '12px' }}>
              <metric.icon size={24} />
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: 500 }}>{metric.title}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>{metric.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{metric.trend}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2330', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>Recent Invoices</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Search invoices..." style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #1f2330', background: '#0a0a0a', outline: 'none', color: '#f8fafc', fontSize: '0.875rem', width: '200px' }} />
              </div>
              <button style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 12px', background: '#0a0a0a', border: '1px solid #1f2330', borderRadius: '8px', color: '#cbd5e1', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' }}>
                <Filter size={16} /> Filter
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #1f2330' }}>
                  <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Invoice ID</th>
                  <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Supplier</th>
                  <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}></th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No invoices found.</td>
                  </tr>
                ) : (
                  invoices.slice(0, 8).map(inv => {
                    const s = getStatusStyle(inv.status);
                    return (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #1f2330' }}>
                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>{inv.id.substring(0, 8).toUpperCase()}</td>
                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: '#cbd5e1' }}>{inv.supplier}</td>
                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: '#9ca3af' }}>{new Date(inv.date).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>₹ {inv.total.toLocaleString()}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ display: 'inline-block', background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {s.label}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', position: 'relative' }}>
                          <button onClick={() => setOpenMenuId(openMenuId === inv.id ? null : inv.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                            <MoreVertical size={18} />
                          </button>
                          
                          {openMenuId === inv.id && (
                            <div style={{ position: 'absolute', right: '40px', top: '16px', background: '#161922', border: '1px solid #1f2330', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 10, minWidth: '150px' }}>
                              <button onClick={() => handleUpdateStatus(inv.id, 'PENDING')} style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: '#f8fafc', fontSize: '0.875rem', textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid #1f2330' }}>
                                Mark as Pending
                              </button>
                              <button onClick={() => handleUpdateStatus(inv.id, 'PAID')} style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: '#f8fafc', fontSize: '0.875rem', textAlign: 'left', cursor: 'pointer' }}>
                                Mark as Paid
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '16px 24px', borderTop: '1px solid #1f2330', textAlign: 'center' }}>
            <button style={{ background: 'none', border: 'none', color: '#b48600', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>View All Invoices <ArrowRight size={16}/></button>
          </div>
        </div>

        <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)', padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', color: '#f8fafc', fontSize: '1.1rem' }}>Cash Outflow (6 Months)</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outflowData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2330" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', background: '#0a0a0a', color: '#f8fafc', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                  formatter={(value: any) => [`₹ ${Number(value).toLocaleString()}`, 'Outflow']}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={32}>
                  {outflowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === outflowData.length - 1 ? '#e11d48' : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Processing Confirmation Modal */}
      {aiModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#161922', borderRadius: '16px', width: '100%', maxWidth: '500px', overflow: 'hidden', border: '1px solid #1f2330', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1f2330' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 color="#22c55e" /> AI Extracted Data
              </h2>
              <button onClick={() => setAiModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
            
            <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: '#9ca3af', margin: '0 0 8px 0', fontSize: '0.875rem' }}>
                Please review the information extracted by the AI from your invoice. You can make corrections before saving.
              </p>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Supplier Name</label>
                <input 
                  type="text" 
                  value={parsedData.supplier} 
                  onChange={e => setParsedData({...parsedData, supplier: e.target.value})} 
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', background: '#0a0a0a', outline: 'none', color: '#f8fafc' }} 
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Invoice Date</label>
                <input 
                  type="date" 
                  value={parsedData.date} 
                  onChange={e => setParsedData({...parsedData, date: e.target.value})} 
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', background: '#0a0a0a', outline: 'none', color: '#f8fafc' }} 
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Total Amount (₹)</label>
                <input 
                  type="number" 
                  value={parsedData.total} 
                  onChange={e => setParsedData({...parsedData, total: parseFloat(e.target.value) || 0})} 
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #1f2330', background: '#0a0a0a', outline: 'none', color: '#f8fafc' }} 
                />
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '16px 24px', background: '#0f1219', borderTop: '1px solid #1f2330', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setAiModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: '#161922', border: '1px solid #1f2330', fontWeight: 500, color: '#9ca3af', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmInvoice} style={{ padding: '10px 16px', borderRadius: '8px', background: '#6366f1', border: 'none', fontWeight: 500, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Save Verified Invoice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
