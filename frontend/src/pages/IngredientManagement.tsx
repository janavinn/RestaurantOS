import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Search, X, Send, Clock, CheckCircle, Plus } from 'lucide-react';

export default function IngredientManagement() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [requestingItem, setRequestingItem] = useState<any | null>(null);
  const [requestQuantity, setRequestQuantity] = useState('');
  
  // Custom item modal state
  const [customRequestOpen, setCustomRequestOpen] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemQuantity, setCustomItemQuantity] = useState('');

  const fetchData = async () => {
    try {
      const invRes = await fetch((import.meta.env.VITE_API_URL || '') + '/api/inventory', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (invRes.ok) {
        const invData = await invRes.json();
        setIngredients(invData);
      }

      const reqRes = await fetch((import.meta.env.VITE_API_URL || '') + '/api/purchase-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setPendingRequests(reqData.filter((r: any) => r.status === 'PENDING'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const poll = setInterval(fetchData, 10000);
    return () => clearInterval(poll);
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingItem || !requestQuantity) return;

    try {
      await fetch((import.meta.env.VITE_API_URL || '') + '/api/purchase-requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          itemName: requestingItem.name,
          quantity: `${requestQuantity} ${requestingItem.unit}`
        })
      });
      
      setRequestingItem(null);
      setRequestQuantity('');
      fetchData(); // Refresh to show new pending request
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName || !customItemQuantity) return;

    try {
      await fetch((import.meta.env.VITE_API_URL || '') + '/api/purchase-requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          itemName: customItemName,
          quantity: customItemQuantity
        })
      });
      
      setCustomRequestOpen(false);
      setCustomItemName('');
      setCustomItemQuantity('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStock = filteredIngredients.filter(ing => ing.stockLevel <= ing.minStock);
  const normalStock = filteredIngredients.filter(ing => ing.stockLevel > ing.minStock);

  return (
    <div style={{ padding: '32px', background: '#0f1219', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#43210b', color: '#f97316', padding: '12px', borderRadius: '12px' }}>
            <Package size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>Restock Portal</h1>
            <p style={{ margin: 0, color: '#9ca3af' }}>Request ingredients that are running out of stock.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search ingredients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', 
                border: '1px solid #1f2330', background: '#161922', color: '#f8fafc',
                fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
          <button onClick={() => setCustomRequestOpen(true)} style={{ background: '#f97316', border: 'none', color: 'white', padding: '12px 20px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add Custom Request
          </button>
        </div>
      </div>

      <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Ingredients List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Low Stock Section */}
          <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #ef444450', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', background: '#ef444420', borderBottom: '1px solid #ef444450', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="#ef4444" />
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#ef4444' }}>Running Low</h2>
            </div>
            
            <div style={{ padding: '0 24px' }}>
              {loading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
              ) : lowStock.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No items are currently running low.</div>
              ) : (
                lowStock.map((ing, i) => (
                  <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i === lowStock.length - 1 ? 'none' : '1px solid #1f2330' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: '#f8fafc', marginBottom: '4px' }}>{ing.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Current Stock: <strong style={{ color: '#ef4444' }}>{ing.stockLevel} {ing.unit}</strong> (Min: {ing.minStock} {ing.unit})</div>
                    </div>
                    <button onClick={() => setRequestingItem(ing)} style={{ background: '#f97316', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                      Request Restock
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Normal Stock Section */}
          <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #1f2330', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color="#22c55e" />
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>Adequate Stock</h2>
            </div>
            
            <div style={{ padding: '0 24px' }}>
              {loading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
              ) : normalStock.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No items found.</div>
              ) : (
                normalStock.map((ing, i) => (
                  <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i === normalStock.length - 1 ? 'none' : '1px solid #1f2330' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: '#f8fafc', marginBottom: '4px' }}>{ing.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Current Stock: <strong style={{ color: '#22c55e' }}>{ing.stockLevel} {ing.unit}</strong></div>
                    </div>
                    <button onClick={() => setRequestingItem(ing)} style={{ background: 'transparent', border: '1px solid #f97316', color: '#f97316', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                      Request More
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Pending Requests */}
        <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', height: 'fit-content' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1f2330', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="#3b82f6" />
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>Pending Requests</h2>
          </div>
          
          <div style={{ padding: '16px 24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0' }}>Loading requests...</div>
            ) : pendingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0' }}>No pending requests.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingRequests.map(req => (
                  <div key={req.id} style={{ background: '#1f2330', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{req.itemName}</div>
                      <div style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem' }}>{req.quantity}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Requested by: {req.requestedBy}</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL: Request Restock */}
      {requestingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#161922', borderRadius: '16px', padding: '32px', width: '400px', maxWidth: '90%', border: '1px solid #1f2330', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>Request Restock</h2>
              <button onClick={() => setRequestingItem(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginBottom: '8px' }}>
              Item: <strong style={{ color: '#f8fafc' }}>{requestingItem.name}</strong>
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginBottom: '24px' }}>
              Current Stock: <strong style={{ color: requestingItem.stockLevel <= requestingItem.minStock ? '#ef4444' : '#22c55e' }}>{requestingItem.stockLevel} {requestingItem.unit}</strong>
            </p>
            
            <form onSubmit={handleRequestSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.9rem', marginBottom: '8px' }}>Quantity Needed ({requestingItem.unit})</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#0f1219', border: '1px solid #1f2330', borderRadius: '8px', padding: '0 16px' }}>
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder="e.g. 5"
                    value={requestQuantity}
                    onChange={(e) => setRequestQuantity(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#f8fafc', padding: '12px 0', outline: 'none', flex: 1, fontSize: '1rem' }}
                  />
                  <span style={{ color: '#9ca3af', fontWeight: 600 }}>{requestingItem.unit}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setRequestingItem(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #1f2330', background: 'transparent', color: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={!requestQuantity} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#f97316', color: 'white', fontWeight: 600, cursor: requestQuantity ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '8px', opacity: requestQuantity ? 1 : 0.5 }}>
                  <Send size={16} /> Send Request
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL: Custom Request */}
      {customRequestOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#161922', borderRadius: '16px', padding: '32px', width: '400px', maxWidth: '90%', border: '1px solid #1f2330', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>Custom Request</h2>
              <button onClick={() => setCustomRequestOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ color: '#9ca3af', fontSize: '0.95rem', marginBottom: '24px' }}>
              Request an ingredient that isn't currently listed in the inventory system.
            </p>
            
            <form onSubmit={handleCustomRequestSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.9rem', marginBottom: '8px' }}>Ingredient Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Saffron"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  style={{ width: '100%', background: '#0f1219', border: '1px solid #1f2330', color: '#f8fafc', padding: '12px 16px', borderRadius: '8px', outline: 'none', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.9rem', marginBottom: '8px' }}>Quantity Needed</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 50 grams"
                  value={customItemQuantity}
                  onChange={(e) => setCustomItemQuantity(e.target.value)}
                  style={{ width: '100%', background: '#0f1219', border: '1px solid #1f2330', color: '#f8fafc', padding: '12px 16px', borderRadius: '8px', outline: 'none', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setCustomRequestOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #1f2330', background: 'transparent', color: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={!customItemName || !customItemQuantity} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#f97316', color: 'white', fontWeight: 600, cursor: (customItemName && customItemQuantity) ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '8px', opacity: (customItemName && customItemQuantity) ? 1 : 0.5 }}>
                  <Send size={16} /> Send Request
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
