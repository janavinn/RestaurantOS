import React, { useState, useEffect, useMemo } from 'react';
import { Package, Search, Filter, AlertTriangle, Info, PlusCircle, CheckCircle2, X } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  minStock: number;
  unit: string;
  supplierName: string;
}

export default function InventoryOverview() {
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Ingredient | null>(null);
  
  // Request Stock Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestQuantity, setRequestQuantity] = useState('');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(inventory.map(i => i.category)))];

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchQuery, selectedCategory]);

  const handleRequestStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !requestQuantity) return;
    
    setRequestStatus('submitting');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          itemName: selectedItem.name,
          quantity: requestQuantity
        })
      });

      if (res.ok) {
        setRequestStatus('success');
        setTimeout(() => {
          setShowRequestModal(false);
          setSelectedItem(null);
          setRequestStatus('idle');
          setRequestQuantity('');
        }, 1500);
      } else {
        setRequestStatus('error');
      }
    } catch (err) {
      console.error('Failed to request stock:', err);
      setRequestStatus('error');
    }
  };

  const getStatusBadge = (stock: number, min: number) => {
    if (stock === 0) {
      return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '9999px', background: 'rgba(185, 28, 28, 0.2)', color: '#f87171', fontSize: '0.75rem', fontWeight: 600 }}><AlertTriangle size={14}/> Out of Stock</span>;
    }
    if (stock <= min) {
      return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '9999px', background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: 600 }}><AlertTriangle size={14}/> Low Stock</span>;
    }
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '9999px', background: 'rgba(21, 128, 61, 0.2)', color: '#4ade80', fontSize: '0.75rem', fontWeight: 600 }}><CheckCircle2 size={14}/> In Stock</span>;
  };

  if (loading) {
    return <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Loading inventory...</div>;
  }

  const lowStockCount = inventory.filter(i => i.stockLevel <= i.minStock).length;

  return (
    <div style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: 'transparent', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 8px 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={28} color="#4f46e5" />
            Inventory Management
          </h1>
          <p style={{ margin: 0, color: '#9ca3af' }}>Monitor stock levels and request supplies when needed.</p>
        </div>
        {lowStockCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(185, 28, 28, 0.2)', color: '#f87171', padding: '12px 20px', borderRadius: '12px', fontWeight: 600, border: '1px solid #fecaca', boxShadow: '0 4px 6px -1px rgba(220,38,38,0.1)' }}>
            <AlertTriangle size={20} />
            {lowStockCount} items need attention
          </div>
        )}
      </div>

      <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search ingredients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: 'none',
                background: selectedCategory === cat ? '#4f46e5' : '#f1f5f9',
                color: selectedCategory === cat ? 'white' : '#9ca3af',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '16px', color: '#9ca3af', fontWeight: 600, fontSize: '0.875rem' }}>Ingredient</th>
                <th style={{ padding: '16px', color: '#9ca3af', fontWeight: 600, fontSize: '0.875rem' }}>Category</th>
                <th style={{ padding: '16px', color: '#9ca3af', fontWeight: 600, fontSize: '0.875rem' }}>Available Qty</th>
                <th style={{ padding: '16px', color: '#9ca3af', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '16px', color: '#9ca3af', fontWeight: 600, fontSize: '0.875rem' }}>Supplier</th>
                <th style={{ padding: '16px', color: '#9ca3af', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px', fontWeight: 600, color: '#f8fafc' }}>{item.name}</td>
                    <td style={{ padding: '16px', color: '#9ca3af', fontSize: '0.875rem' }}>{item.category}</td>
                    <td style={{ padding: '16px', fontWeight: 600, color: item.stockLevel <= item.minStock ? '#f87171' : '#0f172a' }}>
                      {item.stockLevel} {item.unit}
                    </td>
                    <td style={{ padding: '16px' }}>{getStatusBadge(item.stockLevel, item.minStock)}</td>
                    <td style={{ padding: '16px', color: '#9ca3af', fontSize: '0.875rem' }}>{item.supplierName || 'Not Assigned'}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedItem(item)}
                        style={{ padding: '8px 16px', borderRadius: '6px', background: '#161922', border: '1px solid #cbd5e1', color: '#b48600', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Info size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                    No ingredients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && !showRequestModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#161922', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>{selectedItem.name}</h3>
                {getStatusBadge(selectedItem.stockLevel, selectedItem.minStock)}
              </div>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#0f1219', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Available Stock</span>
                <span style={{ fontWeight: 700, color: selectedItem.stockLevel <= selectedItem.minStock ? '#f87171' : '#0f172a' }}>{selectedItem.stockLevel} {selectedItem.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#0f1219', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Minimum Required</span>
                <span style={{ fontWeight: 600, color: '#9ca3af' }}>{selectedItem.minStock} {selectedItem.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#0f1219', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Supplier</span>
                <span style={{ fontWeight: 600, color: '#9ca3af' }}>{selectedItem.supplierName || 'N/A'}</span>
              </div>
            </div>

            <button 
              onClick={() => setShowRequestModal(true)}
              style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#b48600', color: '#161922', fontWeight: 600, fontSize: '1rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <PlusCircle size={20} />
              Request Stock
            </button>
          </div>
        </div>
      )}

      {/* Request Stock Modal */}
      {selectedItem && showRequestModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#161922', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>Request {selectedItem.name}</h3>
              <button onClick={() => { setShowRequestModal(false); setRequestStatus('idle'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={24} />
              </button>
            </div>

            {requestStatus === 'success' ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(21, 128, 61, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#4ade80' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.125rem', color: '#f8fafc' }}>Request Sent</h4>
                <p style={{ margin: 0, color: '#9ca3af' }}>The Owner/Store Keeper has been notified.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestStock}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>Quantity Needed ({selectedItem.unit})</label>
                  <input 
                    type="number" 
                    value={requestQuantity}
                    onChange={(e) => setRequestQuantity(e.target.value)}
                    placeholder="e.g. 20"
                    min="1"
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
                  />
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Current Stock: {selectedItem.stockLevel} {selectedItem.unit}
                  </p>
                </div>
                
                {requestStatus === 'error' && (
                  <div style={{ padding: '12px', background: 'rgba(185, 28, 28, 0.2)', color: '#f87171', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem' }}>
                    Failed to send request. Please try again.
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={requestStatus === 'submitting'}
                  style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#b48600', color: '#161922', fontWeight: 600, fontSize: '1rem', border: 'none', cursor: requestStatus === 'submitting' ? 'not-allowed' : 'pointer', opacity: requestStatus === 'submitting' ? 0.7 : 1 }}
                >
                  {requestStatus === 'submitting' ? 'Sending Request...' : 'Send Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
