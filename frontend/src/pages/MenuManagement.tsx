import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Menu as MenuIcon, Plus, Search, Filter, Edit3, Trash2, CheckCircle2,
  XCircle, ArrowUpRight, ArrowDownRight, ChefHat, Image as ImageIcon, X
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string | null;
  img: string | null;
  available: boolean;
  categoryId: string;
  category?: Category;
}

export default function MenuManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Modals
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Forms
  const initialDishForm = { id: '', name: '', price: '', description: '', img: '', categoryId: '', available: true };
  const [dishForm, setDishForm] = useState(initialDishForm);
  const [categoryName, setCategoryName] = useState('');

  const fetchMenuData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [catRes, itemsRes] = await Promise.all([
        fetch('/api/menu/categories', { headers }),
        fetch('/api/menu', { headers })
      ]);

      if (catRes.ok && itemsRes.ok) {
        const cats = await catRes.json();
        const items = await itemsRes.json();
        setCategories(cats);
        setMenuItems(items);
      }
    } catch (err) {
      console.error('Failed to fetch menu data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  // Compute Metrics
  const activeItemsCount = menuItems.filter(i => i.available).length;
  const unavailableItemsCount = menuItems.filter(i => !i.available).length;

  const METRICS_DATA = [
    { id: 1, title: 'Total Menu Items', value: menuItems.length.toString(), desc: 'Registered in system', color: '#c084fc', bg: 'rgba(126, 34, 206, 0.2)' },
    { id: 2, title: 'Categories', value: categories.length.toString(), desc: 'Active menu sections', color: '#059669', bg: '#d1fae5' },
    { id: 3, title: 'Available Items', value: activeItemsCount.toString(), desc: 'Ready to order', color: '#2563eb', bg: '#dbeafe' },
    { id: 4, title: "86'd Items", value: unavailableItemsCount.toString(), desc: 'Currently unavailable', color: '#e11d48', bg: '#ffe4e6' },
  ];

  // Dish Handlers
  const handleDishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = dishForm.id 
        ? `/api/menu/${dishForm.id}` 
        : '/api/menu';
      const method = dishForm.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(dishForm)
      });

      if (res.ok) {
        setIsDishModalOpen(false);
        setDishForm(initialDishForm);
        fetchMenuData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save menu item');
      }
    } catch (err) {
      alert('An error occurred');
    }
  };

  const handleEditDish = (item: MenuItem) => {
    setDishForm({
      id: item.id,
      name: item.name,
      price: item.price.toString(),
      description: item.description || '',
      img: item.img || '',
      categoryId: item.categoryId,
      available: item.available
    });
    setIsDishModalOpen(true);
  };

  const handleDeleteDish = async (id: string) => {
    if (!window.confirm('Are you sure you want to completely remove this dish?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchMenuData();
    } catch (err) {
      alert('Failed to delete dish');
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ available: !item.available })
      });
      if (res.ok) {
        fetchMenuData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Category Handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/menu/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: categoryName })
      });
      if (res.ok) {
        setCategoryName('');
        fetchMenuData();
      } else {
        alert('Failed to add category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category? Ensure no items belong to it first.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/menu/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMenuData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Data
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: 'transparent', minHeight: '100vh' }}>
      
      {/* Breadcrumb & Header */}
      <div style={{ fontSize: '0.875rem', color: '#b48600', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#9ca3af' }}>Menu Management</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(67, 56, 202, 0.2)', color: '#b48600', padding: '12px', borderRadius: '12px' }}>
            <MenuIcon size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>Menu Management</h1>
            <p style={{ margin: 0, color: '#9ca3af' }}>Design your digital menu, manage pricing, and control item availability instantly.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setIsCategoryModalOpen(true)} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#161922', border: '1px solid #1f2330', padding: '10px 20px', borderRadius: '8px', color: '#b48600', fontWeight: 600, cursor: 'pointer' }}>
            <Filter size={16} /> Manage Categories
          </button>
          <button onClick={() => { setDishForm(initialDishForm); setIsDishModalOpen(true); }} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#b48600', border: 'none', padding: '10px 20px', borderRadius: '8px', color: '#161922', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={16} /> Add Menu Item
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {METRICS_DATA.map(metric => (
          <div key={metric.id} style={{ background: '#161922', borderRadius: '12px', border: '1px solid #1f2330', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ background: metric.bg, color: metric.color, padding: '12px', borderRadius: '12px' }}>
                {metric.id === 1 ? <MenuIcon size={20} /> : metric.id === 2 ? <Filter size={20} /> : metric.id === 3 ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 500 }}>{metric.title}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0' }}>{metric.value}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{metric.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Layout: Sidebar + Grid */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* LEFT SIDEBAR: Category Filters */}
        <div style={{ width: '250px', flexShrink: 0, background: '#161922', borderRadius: '12px', border: '1px solid #1f2330', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f2330', background: '#0f1219', fontWeight: 600, color: '#e2e8f0' }}>
            Menu Categories
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div 
              style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1f2330', background: activeCategory === 'all' ? 'rgba(67, 56, 202, 0.2)' : '#161922', color: activeCategory === 'all' ? '#4f46e5' : '#9ca3af', fontWeight: activeCategory === 'all' ? 600 : 500 }}
              onClick={() => setActiveCategory('all')}
            >
              <MenuIcon size={18} /> All Items
            </div>
            {categories.map(cat => (
              <div 
                key={cat.id} 
                style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1f2330', background: activeCategory === cat.id ? 'rgba(67, 56, 202, 0.2)' : '#161922', color: activeCategory === cat.id ? '#4f46e5' : '#9ca3af', fontWeight: activeCategory === cat.id ? 600 : 500 }}
                onClick={() => setActiveCategory(cat.id)}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeCategory === cat.id ? '#4f46e5' : '#cbd5e1' }} />
                {cat.name}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CONTENT: Items Grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Search Bar */}
          <div style={{ display: 'flex', gap: '16px', background: '#161922', padding: '16px', borderRadius: '12px', border: '1px solid #1f2330' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '14px' }} />
              <input 
                type="text" 
                placeholder="Search menu items..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '8px', border: '1px solid #1f2330', outline: 'none', background: '#0f1219', color: '#f8fafc' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredItems.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#9ca3af', background: '#161922', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                No menu items found. Try adjusting your search or category.
              </div>
            ) : (
              filteredItems.map(item => (
                <div key={item.id} style={{ background: '#161922', borderRadius: '12px', border: '1px solid #1f2330', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} className="menu-card-hover">
                  
                  {/* Image Placeholder */}
                  <div style={{ height: '140px', background: item.img ? `url(${item.img}) center/cover` : 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {!item.img && <ImageIcon size={40} color="#94a3b8" opacity={0.5} />}
                    {/* Availability Tag */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: item.available ? 'rgba(21, 128, 61, 0.2)' : 'rgba(185, 28, 28, 0.2)', color: item.available ? '#4ade80' : '#f87171', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, display: 'flex', gap: '4px', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {item.available ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {item.available ? 'AVAILABLE' : "UNAVAILABLE"}
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.75rem', color: '#b48600', fontWeight: 600, marginBottom: '4px' }}>
                      {item.category?.name.toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', fontWeight: 600, lineHeight: 1.3 }}>{item.name}</h3>
                    </div>
                    <div style={{ color: '#059669', fontWeight: 700, fontSize: '1.25rem', marginBottom: '12px' }}>₹ {item.price}</div>
                    
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#9ca3af', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description || 'No description provided.'}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', borderTop: '1px solid #1f2330', paddingTop: '16px' }}>
                      <button 
                        onClick={() => toggleAvailability(item)}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: item.available ? 'rgba(185, 28, 28, 0.2)' : 'rgba(21, 128, 61, 0.2)',
                          color: item.available ? '#f87171' : '#4ade80'
                        }}
                      >
                        {item.available ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                      <button onClick={() => handleEditDish(item)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: '#0f1219', border: '1px solid #1f2330', color: '#9ca3af', cursor: 'pointer' }}>
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDeleteDish(item.id)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: '#0f1219', border: '1px solid #1f2330', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* DISH MODAL */}
      {isDishModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#161922', borderRadius: '16px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1f2330', background: '#0f1219' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>{dishForm.id ? 'Edit Dish' : 'Add New Dish'}</h2>
              <button onClick={() => setIsDishModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleDishSubmit}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Dish Name</label>
                  <input type="text" required value={dishForm.name} onChange={e => setDishForm({...dishForm, name: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="Paneer Tikka" />
                </div>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Category</label>
                    <select required value={dishForm.categoryId} onChange={e => setDishForm({...dishForm, categoryId: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#161922' }}>
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Price (₹)</label>
                    <input type="number" required min="0" step="0.01" value={dishForm.price} onChange={e => setDishForm({...dishForm, price: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="250" />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Image URL</label>
                  <input type="url" value={dishForm.img} onChange={e => setDishForm({...dishForm, img: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="https://example.com/image.jpg" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Description</label>
                  <textarea value={dishForm.description} onChange={e => setDishForm({...dishForm, description: e.target.value})} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '80px', resize: 'vertical' }} placeholder="Delicious cottage cheese marinated in spices..."></textarea>
                </div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
                  <input type="checkbox" checked={dishForm.available} onChange={e => setDishForm({...dishForm, available: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>Currently Available</span>
                </label>

              </div>
              <div style={{ padding: '16px 24px', background: '#0f1219', borderTop: '1px solid #1f2330', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsDishModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: '#161922', border: '1px solid #cbd5e1', fontWeight: 500, color: '#9ca3af', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', background: '#6366f1', border: 'none', fontWeight: 500, color: '#161922', cursor: 'pointer' }}>Save Dish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#161922', borderRadius: '16px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1f2330', background: '#0f1219' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>Manage Categories</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Add New Category */}
              <form onSubmit={handleCategorySubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e2e8f0' }}>New Category</label>
                  <input type="text" required value={categoryName} onChange={e => setCategoryName(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="e.g. Starters" />
                </div>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', background: '#6366f1', border: 'none', color: '#161922', fontWeight: 600, cursor: 'pointer', height: '42px' }}>
                  Add
                </button>
              </form>

              <hr style={{ border: 'none', borderTop: '1px solid #1f2330', margin: '8px 0' }} />

              {/* List Categories */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af', marginBottom: '4px' }}>Existing Categories</label>
                {categories.length === 0 ? (
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>No categories created yet.</div>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#0f1219', border: '1px solid #1f2330', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f8fafc' }}>{cat.name}</span>
                      <button onClick={() => handleDeleteCategory(cat.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Delete Category">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .menu-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
        }
      `}</style>
    </div>
  );
}
