import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Bot, TicketPlus, History, User, LogOut,
  ChevronDown, Search, Bell, CheckCircle2, AlertTriangle, Layers, Users, Settings,
  Sparkles, Menu, X
} from 'lucide-react';

const mockNotifications = [
  { id: 1, text: 'AI Diagnostic checklist generated for your request', time: '5 mins ago', type: 'ai' },
  { id: 2, text: 'Ticket TKT-000007 priority updated to High', time: '20 mins ago', type: 'info' },
  { id: 3, text: 'Support Engineer resolved your issue', time: '1 hour ago', type: 'resolved' }
];

const AppHeader = ({ portalType = 'user' }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const dropdownRef = useRef(null);

  const isAdmin = portalType === 'admin';

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : isAdmin ? 'SA' : 'UP';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userNavLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Raise Ticket', path: '/raise-ticket', icon: TicketPlus },
    { label: 'My Tickets', path: '/my-tickets', icon: History },
    { label: 'Profile', path: '/profile', icon: User }
  ];

  const adminNavLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'All Tickets', path: '/admin/tickets', icon: Layers },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const navLinks = isAdmin ? adminNavLinks : userNavLinks;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const target = isAdmin ? `/admin/tickets?search=${encodeURIComponent(searchTerm)}` : `/my-tickets?search=${encodeURIComponent(searchTerm)}`;
      navigate(target);
    }
  };

  return (
    <header className="shared-app-header">
      <div className="shared-header-inner">

        {/* ── LEFT SECTION: BRAND LOGO & SEARCH BAR ────────────────────── */}
        <div className="header-left-group">
          <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="shared-header-brand">
            <div className="brand-icon-box">
              <Bot size={22} color="white" />
            </div>
            <span className="brand-title-text">
              SupportPilot <strong style={{ color: 'var(--primary)' }}>AI</strong>
            </span>
          </Link>

          <form onSubmit={handleSearchSubmit} className="search-bar-wrap">
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder={isAdmin ? "Search tickets, users..." : "Search tickets, requests..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>

        {/* ── CENTER SECTION: NAVIGATION & CURRENT DATE ───────────────── */}
        <div className="header-center-group">
          <nav className="header-nav-items">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`header-nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <span className="top-bar-date header-date-text">📅 {currentDate}</span>
        </div>

        {/* ── RIGHT SECTION: NOTIFICATIONS & PROFILE PILL ─────────────── */}
        <div className="header-right-group">

          {/* Notification Bell */}
          <div className="notif-bell-wrap" ref={notifRef}>
            <button
              type="button"
              className="notif-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={20} />
              <span className="notif-badge-count">3</span>
            </button>

            {showNotifications && (
              <div className="notif-dropdown animate-slide-up">
                <div className="notif-header">
                  <strong>Notifications</strong>
                  <span className="notif-count-tag">3 New</span>
                </div>
                <div className="notif-list">
                  {mockNotifications.map((n) => (
                    <div key={n.id} className="notif-item">
                      {n.type === 'critical' ? (
                        <AlertTriangle size={16} color="#EF4444" />
                      ) : n.type === 'resolved' ? (
                        <CheckCircle2 size={16} color="#10B981" />
                      ) : (
                        <Sparkles size={16} color="#8B5CF6" />
                      )}
                      <div>
                        <p>{n.text}</p>
                        <span>{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Pill & Dropdown */}
          <div className="nav-user-area" ref={dropdownRef}>
            <div
              className="admin-profile-pill"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title="Account Options"
              style={{ cursor: 'pointer' }}
            >
              <div className="admin-avatar-sm" style={{ background: isAdmin ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : 'linear-gradient(135deg, #4F46E5, #8B5CF6)' }}>
                {initials}
              </div>
              <div className="admin-info-text">
                <span className="admin-name-text">{user?.name || (isAdmin ? 'Super Admin' : 'Enterprise User')}</span>
                <span className="admin-role-text">{user?.department || (isAdmin ? 'Enterprise Administrator' : 'User Portal')}</span>
              </div>
              <ChevronDown size={16} className={`dropdown-chevron ${dropdownOpen ? 'open' : ''}`} style={{ color: 'var(--text-muted)', marginLeft: '0.2rem' }} />
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="user-dropdown-menu animate-slide-up">
                <div className="dropdown-header">
                  <strong>{user?.name}</strong>
                  <span>{user?.email}</span>
                </div>
                <div className="dropdown-divider"></div>

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate(isAdmin ? '/admin/settings' : '/profile');
                  }}
                >
                  <User size={16} /> {isAdmin ? 'Admin Settings' : 'Profile'}
                </button>

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate(isAdmin ? '/admin/dashboard' : '/dashboard');
                  }}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>

                <div className="dropdown-divider"></div>

                <button
                  type="button"
                  className="dropdown-item logout-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Drawer Button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer animate-slide-up">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={18} /> {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default AppHeader;
