import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request reset link');
      }
      
      if (data.resetUrl) {
        window.location.href = data.resetUrl;
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-layout">
      {/* Left Hero Section (Reused from Login for consistency) */}
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
             Regain access to your<br/>
             <span className="text-highlight">workspace.</span>
           </h1>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="login-form-container">
        <div className="login-form-wrapper">
          <Link to="/aarunya/owner/login" className="back-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>

          <h2 className="login-title">Forgot Password</h2>
          <p className="login-subtitle">Enter your email address and we'll send you a link to reset your password.</p>

          {success ? (
            <div style={{ padding: '2rem', backgroundColor: '#ecfdf5', borderRadius: '12px', textAlign: 'center', border: '1px solid #d1fae5' }}>
              <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#065f46', marginBottom: '0.5rem' }}>Check your email</h3>
              <p style={{ color: '#047857', fontSize: '0.95rem' }}>
                We've sent password reset instructions to <strong>{email}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              {error && <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fee2e2' }}>{error}</div>}
              
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="email" 
                    value={email}
                    placeholder="Enter your email" 
                    required 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>

              <button type="submit" className="btn-signin" disabled={isLoading} style={{ marginTop: '1rem' }}>
                 {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="login-footer" style={{ marginTop: '3rem' }}>
            © 2024 Aarunya. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
