import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, CheckCircle, Bot, ShieldCheck, User, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [loginType, setLoginType] = useState('user'); // 'user' | 'admin'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleTabSwitch = (type) => {
    if (type === loginType) return;
    setLoginType(type);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      if (loginType === 'user' && user.role !== 'user') {
        setError('Please use the Admin Login tab to sign in as an administrator.');
        localStorage.removeItem('sams_token');
        return;
      }

      if (loginType === 'admin' && user.role !== 'admin' && user.role !== 'superadmin') {
        setError('This portal is for administrators only. Please use the User Login tab.');
        localStorage.removeItem('sams_token');
        return;
      }

      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isAdminTab = loginType === 'admin';

  return (
    <div className="auth-container">

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div className="auth-left">
        <h1 className="auth-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bot size={42} /> SupportPilot <span style={{ color: '#A5B4FC' }}>AI</span>
        </h1>
        <p className="auth-tagline">
          Next-generation AI-powered IT Helpdesk Assistant. Resolve IT issues in seconds with Google Gemini 2.5 Flash.
        </p>

        <div className="auth-features">
          <div className="feature-item">
            <div className="feature-icon"><CheckCircle size={24} /></div>
            <span>Instant AI Diagnostic Checklist</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><Bot size={24} /></div>
            <span>Gemini 2.5 Flash Engine</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><ShieldCheck size={24} /></div>
            <span>Enterprise SLA & Ticket Management</span>
          </div>
        </div>

        <svg
          className="auth-decorative"
          width="400"
          height="400"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#FFFFFF"
            d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.4,-46.3C91,-33.5,97.2,-18,97,-2.6C96.8,12.8,90.2,28.1,80.1,40.9C70,53.7,56.4,64,41.5,71.1C26.6,78.2,10.4,82.1,-5.1,85.1C-20.6,88.1,-35.5,90.2,-48.9,84.7C-62.3,79.2,-74.2,66.1,-82.3,51.2C-90.4,36.3,-94.7,19.6,-94.1,3.4C-93.5,-12.8,-88,-28.5,-78.9,-41.4C-69.8,-54.3,-57.1,-64.4,-43.3,-71.8C-29.5,-79.2,-14.7,-83.9,0.7,-85.1C16.1,-86.3,30.6,-83.6,44.7,-76.4Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-card animate-slide-up">

          <h2 className="auth-card-heading">
            {isAdminTab ? 'Admin Portal' : 'Welcome to SupportPilot AI'}
          </h2>

          <div className="login-type-selector" role="tablist" aria-label="Login type">
            <button
              type="button"
              role="tab"
              aria-selected={!isAdminTab}
              className={`login-tab ${!isAdminTab ? 'login-tab--active' : ''}`}
              onClick={() => handleTabSwitch('user')}
              id="tab-user"
            >
              <User size={16} />
              User Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isAdminTab}
              className={`login-tab ${isAdminTab ? 'login-tab--active login-tab--admin' : ''}`}
              onClick={() => handleTabSwitch('admin')}
              id="tab-admin"
            >
              <ShieldAlert size={16} />
              Admin Login
            </button>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-with-icon">
                <Mail className="icon" size={18} />
                <input
                  id="login-email"
                  type="email"
                  placeholder={isAdminTab ? 'Enter admin email' : 'Enter your email address'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-with-icon">
                <Lock className="icon" size={18} />
                <input
                  id="login-password"
                  type="password"
                  placeholder={isAdminTab ? 'Enter admin password' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`btn-primary btn-full ${isAdminTab ? 'btn-admin' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <div className="loader" style={{ width: '20px', height: '20px' }} />
              ) : (
                isAdminTab ? 'Sign in as Admin' : 'Login to SupportPilot AI'
              )}
            </button>
          </form>

          {!isAdminTab && (
            <Link to="/register" className="auth-link">
              Don't have an account? Register here.
            </Link>
          )}

          {isAdminTab && (
            <p className="auth-admin-hint">
              Admin access is restricted to authorized helpdesk managers.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
