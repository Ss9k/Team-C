import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Layers, Users, Settings, LogOut,
  ChevronLeft, ChevronRight, Bell, Search, Bot, CheckCircle2, AlertTriangle,
  TicketPlus, History, User, Sparkles, ChevronDown
} from 'lucide-react';

const mockNotifications = [
  { id: 1, text: 'New update on ticket TKT-000007', time: '10 mins ago', type: 'info' },
  { id: 2, text: 'AI Diagnostic checklist generated successfully', time: '25 mins ago', type: 'ai' },
  { id: 3, text: 'Ticket status changed to Resolved', time: '1 hour ago', type: 'resolved' }
];

const AppLayout = ({ children, portalType = 'user', activeTab = 'dashboard' }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const notifRef = useRef(null);
  const dropdownRef = useRef(null);

  const isAdmin = portalType === 'admin';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : isAdmin ? 'SA' : 'UP';

  // Sidebar Links
  const userSidebarLinks = [
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { key: 'raise-ticket', label: 'Raise Ticket', path: '/raise-ticket', icon: TicketPlus },
    { key: 'my-tickets', label: 'My Tickets', path: '/my-tickets', icon: History },
    { key: 'profile', label: 'Profile', path: '/profile', icon: User }
  ];

  const adminSidebarLinks = [
    { key: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { key: 'tickets', label: 'All Tickets', path: '/admin/tickets', icon: Layers },
    { key: 'users', label: 'Users', path: '/admin/users', icon: Users },
    { key: 'settings', label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const sidebarLinks = isAdmin ? adminSidebarLinks : userSidebarLinks;

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const target = isAdmin
        ? `/admin/tickets?search=${encodeURIComponent(searchTerm)}`
        : `/my-tickets?search=${encodeURIComponent(searchTerm)}`;
      navigate(target);
    }
  };

  return (
    <div className={`admin-app-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      
      {/* ── 1. LEFT SIDEBAR (DARK #1E1B4B) ─────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="admin-brand-icon">
              <Bot size={22} color="white" />
            </div>
            {!collapsed && (
              <span className="brand-title">
                SupportPilot <strong className="badge-purple">{isAdmin ? 'Admin' : 'AI'}</strong>
              </span>
            )}
          </div>

          <button
            className="sidebar-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="sidebar-nav-menu">
          {sidebarLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || activeTab === item.key;
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <Icon size={20} className="sidebar-icon" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer Logout */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={logout} title="Logout">
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── 2. MAIN CONTENT WRAPPER ─────────────────────────────────────── */}
      <div className="admin-main-wrapper">
        
        {/* Top Header Bar */}
        <header className="admin-top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          
          {/* LEFT SECTION: Search Bar */}
          <div className="top-bar-left" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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

          {/* CENTER SECTION: Current Date */}
          <div className="top-bar-center" style={{ display: 'flex', alignItems: 'center' }}>
            <span className="top-bar-date" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              📅 {currentDate}
            </span>
          </div>

          {/* RIGHT SECTION: Notification Bell + Avatar + Bold Name / Gray Dept + Dropdown Arrow */}
          <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            
            {/* Notification Bell */}
            <div className="notif-bell-wrap" ref={notifRef}>
              <button
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

            {/* User Profile Area with Dropdown */}
            <div className="nav-user-area" ref={dropdownRef} style={{ position: 'relative' }}>
              <div
                className="admin-profile-pill"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.35rem 0.6rem', borderRadius: '24px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}
              >
                <div className="admin-avatar-sm" style={{ background: isAdmin ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : 'linear-gradient(135deg, #4F46E5, #8B5CF6)', width: '34px', height: '34px', borderRadius: '50%', color: 'white', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {initials}
                </div>
                <div className="admin-info-text" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <strong className="admin-name-text" style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.2, fontWeight: 700 }}>
                    {user?.name || (isAdmin ? 'Super Admin' : 'Swarup')}
                  </strong>
                  <span className="admin-role-text" style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {user?.department || (isAdmin ? 'Enterprise Administrator' : 'IT Infrastructure')}
                  </span>
                </div>
                <ChevronDown size={15} color="var(--text-muted)" style={{ transition: 'transform 0.2s', transform: profileDropdownOpen ? 'rotate(180deg)' : 'none' }} />
              </div>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="user-dropdown-menu animate-slide-up" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '220px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', padding: '0.5rem', zIndex: 150 }}>
                  <div className="dropdown-header" style={{ padding: '0.75rem 0.85rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>{user?.name || 'Swarup'}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.email || 'user@example.com'}</span>
                  </div>
                  <div className="dropdown-divider" style={{ height: '1px', background: '#F1F5F9', margin: '0.4rem 0' }}></div>
                  <button
                    type="button"
                    className="dropdown-item"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', border: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', borderRadius: '6px' }}
                    onClick={() => { setProfileDropdownOpen(false); navigate(isAdmin ? '/admin/settings' : '/profile'); }}
                  >
                    <User size={16} /> My Profile
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', border: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', borderRadius: '6px' }}
                    onClick={() => { setProfileDropdownOpen(false); navigate(isAdmin ? '/admin/dashboard' : '/dashboard'); }}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                  <div className="dropdown-divider" style={{ height: '1px', background: '#F1F5F9', margin: '0.4rem 0' }}></div>
                  <button
                    type="button"
                    className="dropdown-item logout-item"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', border: 'none', background: 'transparent', color: '#DC2626', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', borderRadius: '6px' }}
                    onClick={() => { setProfileDropdownOpen(false); logout(); }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ── 3. DYNAMIC PAGE CONTENT ───────────────────────────────────── */}
        <main className="admin-page-content" style={{ padding: '1.75rem 2rem' }}>
          {children}
        </main>

      </div>

    </div>
  );
};

export default AppLayout;
