import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, EyeOff, User, BarChart2, Package, Users, FileText, LayoutDashboard } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    restaurantName: 'Aarunya',
    ownerName: '',
    ownerEmail: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      alert('Workspace created successfully!');
      navigate('/aarunya/owner/login');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-layout">
      {/* Left Hero Section */}
      <div className="login-hero" style={{ backgroundImage: 'url(/restaurant-bg.png)' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
           <div className="brand">
             <div className="brand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
                  <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
                  <line x1="6" y1="17" x2="18" y2="17"></line>
                </svg>
             </div>
             <div className="brand-text">
               <h2>Aarunya</h2>
               <p>Smart Restaurant Management</p>
             </div>
           </div>
           
           <h1 className="hero-title">
             Manage your restaurant<br/>
             <span className="text-highlight">smarter, together.</span>
           </h1>
           
           <div className="hero-divider"></div>
           
           <p className="hero-subtitle">
             All-in-one solution to manage your inventory,<br/>
             staff, orders, suppliers, expenses and more.<br/>
             Built for efficiency. Designed for growth.
           </p>

           <div className="feature-grid">
             <div className="feature-card">
               <BarChart2 className="feature-icon" />
               <span>Analytics &<br/>Reports</span>
             </div>
             <div className="feature-card">
               <Package className="feature-icon" />
               <span>Inventory<br/>Management</span>
             </div>
             <div className="feature-card">
               <Users className="feature-icon" />
               <span>Staff<br/>Management</span>
             </div>
             <div className="feature-card">
               <FileText className="feature-icon" />
               <span>AI Invoice<br/>Processing</span>
             </div>
           </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="login-form-container">
        <div className="login-form-wrapper">
          
          <div className="user-avatar-wrapper">
            <div className="user-avatar">
              <LayoutDashboard size={32} color="#6366f1" strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="login-title">Owner Registration</h2>
          <p className="login-subtitle">Create an account to set up your restaurant</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>Restaurant Name</label>
              <div className="input-with-icon">
                <LayoutDashboard size={18} className="input-icon" />
                <input 
                  type="text" 
                  name="restaurantName" 
                  value={formData.restaurantName}
                  required 
                  readOnly
                  style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  name="ownerName" 
                  placeholder="Enter your name" 
                  required 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  name="ownerEmail" 
                  placeholder="Enter your email" 
                  required 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="Create a password" 
                  required 
                  minLength={6}
                  onChange={handleChange} 
                />
                <button 
                  type="button" 
                  className="icon-btn right" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <EyeOff size={18} color="#94a3b8" />
                </button>
              </div>
            </div>

            <button type="submit" className="btn-signin" disabled={isLoading} style={{ marginTop: '20px' }}>
               Create Workspace
            </button>
          </form>

          <div className="divider"><span>or</span></div>
          
          <div style={{textAlign: 'center', fontSize: '0.9rem', fontWeight: '500'}}>
             Already registered? <Link to="/login" style={{color: '#6366f1', textDecoration: 'none'}}>Login Here</Link>
          </div>
          
          <div className="login-footer">
            © 2024 Aarunya. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
