import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Layers, LogOut, Bot } from 'lucide-react';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar admin-nav">
      <div className="nav-container">
        <Link to="/admin/dashboard" className="nav-brand">
          <Bot size={26} color="white" />
          <span>SupportPilot <strong>AI</strong></span>
          <span className="admin-badge">Admin</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`}>
            <LayoutDashboard size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}/>
            Dashboard
          </Link>
          <Link to="/admin/tickets" className={`nav-link ${isActive('/admin/tickets')}`}>
            <Layers size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}/>
            All Tickets
          </Link>
        </div>

        <div className="nav-user">
          <span className="nav-user-name" style={{ color: 'white' }}>{user?.name}</span>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
