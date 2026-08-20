import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, CheckCircle, Cpu, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(name, email, password);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1 className="auth-brand">SAMS</h1>
        <p className="auth-tagline">Join our Smart AI Management System and resolve issues faster.</p>
        
        <div className="auth-features">
          <div className="feature-item">
            <div className="feature-icon"><CheckCircle size={24} /></div>
            <span>Streamlined Ticketing</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><Cpu size={24} /></div>
            <span>Smart Suggestions</span>
          </div>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-card animate-slide-up">
          <h2>Create Account</h2>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-error" style={{backgroundColor: '#DCFCE7', color: '#15803D', borderColor: '#86EFAC'}}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User className="icon" size={18} />
                <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail className="icon" size={18} />
                <input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock className="icon" size={18} />
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
              </div>
            </div>
            
            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? <div className="loader" style={{ width: '20px', height: '20px' }}></div> : 'Register'}
            </button>
          </form>
          
          <Link to="/login" className="auth-link">Already have an account? Login.</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
