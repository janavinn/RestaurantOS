import React from 'react';
import { 
  LayoutDashboard, Sliders, Moon, Bell, Globe, Percent, 
  Save, Monitor, Smartphone, Mail, Settings, Printer
} from 'lucide-react';

export default function Preferences() {
  return (
    <div className="page-container" style={{ padding: '32px', maxWidth: '100%', overflowX: 'hidden', background: 'transparent', minHeight: '100vh' }}>
      
      <div style={{ fontSize: '0.875rem', color: '#b48600', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
        <LayoutDashboard size={14} /> Dashboard <span style={{ color: '#cbd5e1' }}>›</span> <span style={{ color: '#cbd5e1' }}>Restaurant Settings</span>
      </div>

      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="page-title" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(180, 134, 0, 0.15)', color: '#b48600', padding: '12px', borderRadius: '12px' }}>
            <Sliders size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>Restaurant Settings</h1>
            <p style={{ margin: 0, color: '#94a3b8' }}>Configure POS settings, notifications, theme, and regional formats.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#b48600', border: 'none', padding: '10px 24px', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
            <Save size={18} /> Save Settings
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: Appearance & Regional */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          
          {/* Appearance */}
          <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '32px' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#f8fafc', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Monitor size={20} color="#4f46e5" /> Appearance
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #1f2330' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Moon size={16} color="#64748b" /> Dark Mode
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Switch the interface to a darker theme.</div>
                </div>
                <label className="toggle-switch" style={{ margin: 0, cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Interface Density</label>
                <select style={{ width: '100%', padding: '10px 12px', border: '1px solid #1f2330', borderRadius: '8px', outline: 'none', fontSize: '0.95rem', color: '#f8fafc', background: '#131313' }}>
                  <option>Comfortable (Default)</option>
                  <option>Compact (More data on screen)</option>
                  <option>Spacious (Larger touch targets)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '32px' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#f8fafc', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={20} color="#4f46e5" /> Localization
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Currency</label>
                <select style={{ width: '100%', padding: '10px 12px', border: '1px solid #1f2330', borderRadius: '8px', outline: 'none', fontSize: '0.95rem', color: '#f8fafc', background: '#131313' }}>
                  <option>Indian Rupee (₹)</option>
                  <option>US Dollar ($)</option>
                  <option>Euro (€)</option>
                  <option>British Pound (£)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Timezone</label>
                <select style={{ width: '100%', padding: '10px 12px', border: '1px solid #1f2330', borderRadius: '8px', outline: 'none', fontSize: '0.95rem', color: '#f8fafc', background: '#131313' }}>
                  <option>(GMT+05:30) Asia/Kolkata</option>
                  <option>(GMT+00:00) UTC</option>
                  <option>(GMT-05:00) Eastern Time</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Date Format</label>
                <select style={{ width: '100%', padding: '10px 12px', border: '1px solid #1f2330', borderRadius: '8px', outline: 'none', fontSize: '0.95rem', color: '#f8fafc', background: '#131313' }}>
                  <option>DD/MM/YYYY (e.g. 31/07/2026)</option>
                  <option>MM/DD/YYYY (e.g. 07/31/2026)</option>
                  <option>YYYY-MM-DD (e.g. 2026-07-31)</option>
                </select>
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: POS & Notifications */}
        <div style={{ width: '450px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Notifications */}
          <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '32px' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#f8fafc', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={20} color="#4f46e5" /> Alert Preferences
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Smartphone size={16} color="#64748b" /> Low Stock Push Alerts
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Send mobile push notifications when inventory drops below minimum.</div>
                </div>
                <label className="toggle-switch" style={{ margin: 0, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} color="#64748b" /> Daily Financial Summary
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Email a PDF report of daily revenue and expenses at 11:00 PM.</div>
                </div>
                <label className="toggle-switch" style={{ margin: 0, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={16} color="#64748b" /> Staff Login Anomalies
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Alert me if staff login outside of their shift hours.</div>
                </div>
                <label className="toggle-switch" style={{ margin: 0, cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* POS Defaults */}
          <div style={{ background: '#131313', borderRadius: '16px', border: '1px solid #1f2330', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '32px' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#f8fafc', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={20} color="#4f46e5" /> Point of Sale (POS) Settings
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Default Tax Rate (%)</label>
                <div style={{ position: 'relative' }}>
                  <Percent size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="number" defaultValue="5.0" style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #1f2330', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Receipt Header Text</label>
                <textarea rows={3} defaultValue="Aarunya Restaurant&#13;&#10;123 MG Road, Bengaluru&#13;&#10;GSTIN: 29AABCU9603R1ZM" style={{ width: '100%', padding: '10px 12px', border: '1px solid #1f2330', borderRadius: '8px', outline: 'none', fontSize: '0.95rem', resize: 'none' }}></textarea>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>Receipt Footer Text</label>
                <input type="text" defaultValue="Thank you for dining with us!" style={{ width: '100%', padding: '10px 12px', border: '1px solid #1f2330', borderRadius: '8px', outline: 'none', fontSize: '0.95rem' }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
