import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import TicketDetailModal from '../components/TicketDetailModal';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { adminUsersAPI, ticketsAPI } from '../services/api';
import {
  Users, UserCheck, Shield, Clock, Ticket, CheckCircle2, Search, Filter,
  Eye, Edit3, UserX, ArrowUpDown, RefreshCcw, X, Phone, Building2, Mail,
  Calendar, Bot, ChevronRight, Save
} from 'lucide-react';

const DEPARTMENTS = [
  'All',
  'IT Infrastructure',
  'Software & Apps',
  'Hardware & Devices',
  'Network & VPN',
  'Email & Office 365',
  'Accounts & Security',
  'HR & Payroll',
  'General IT Support'
];

const AdminUsers = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search State
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest' | 'most_tickets' | 'least_tickets'

  // Selected User Slide-over Panel State
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [userTickets, setUserTickets] = useState([]);
  const [loadingUserTickets, setLoadingUserTickets] = useState(false);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editDept, setEditDept] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // Selected Ticket Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchUsersAndStats = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        adminUsersAPI.getStats(),
        adminUsersAPI.getAll({ search, department: departmentFilter, role: roleFilter, status: statusFilter })
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, departmentFilter, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsersAndStats();
  }, [fetchUsersAndStats]);

  // Open User Detail Slide-over
  const handleOpenUserDetail = async (userObj) => {
    setSelectedUserDetail(userObj);
    setLoadingUserTickets(true);
    try {
      const [userDetailData, ticketsData] = await Promise.all([
        adminUsersAPI.getOne(userObj.id),
        adminUsersAPI.getUserTickets(userObj.id)
      ]);
      setSelectedUserDetail(userDetailData);
      setUserTickets(ticketsData);
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setLoadingUserTickets(false);
    }
  };

  // Toggle Disable / Enable User
  const handleToggleUserStatus = async (userObj) => {
    const newStatus = userObj.status === 'Disabled' ? 'Active' : 'Disabled';
    try {
      await adminUsersAPI.update(userObj.id, { status: newStatus });
      fetchUsersAndStats();
      if (selectedUserDetail?.user?.id === userObj.id) {
        setSelectedUserDetail((prev) => prev ? { ...prev, user: { ...prev.user, status: newStatus } } : null);
      }
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  // Save User Edits
  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await adminUsersAPI.update(editingUser.id, {
        department: editDept,
        role: editRole,
        status: editStatus
      });
      setEditingUser(null);
      fetchUsersAndStats();
    } catch (err) {
      alert('Failed to save user edits');
    }
  };

  // Filtered & Sorted Users List
  const filteredUsers = users.filter((u) => {
    const sLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(sLower) ||
      u.email.toLowerCase().includes(sLower) ||
      (u.department || '').toLowerCase().includes(sLower);

    const matchesDept = departmentFilter === 'All' || u.department === departmentFilter;
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    } else if (sortOrder === 'oldest') {
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    } else if (sortOrder === 'most_tickets') {
      return (b.total_tickets || 0) - (a.total_tickets || 0);
    } else if (sortOrder === 'least_tickets') {
      return (a.total_tickets || 0) - (b.total_tickets || 0);
    }
    return 0;
  });

  return (
    <AdminLayout activeTab="users">
      <div className="admin-dashboard-container animate-fade-in">
        
        {/* Header Title Bar */}
        <div className="admin-header-title-bar">
          <div>
            <h1><Users size={26} color="var(--primary)" /> Registered User Management</h1>
            <p>View, manage, inspect activity, and review tickets for all registered SupportPilot AI users.</p>
          </div>

          <button className="btn-outline btn-sm" onClick={fetchUsersAndStats}>
            <RefreshCcw size={16} /> Refresh Users
          </button>
        </div>

        {/* ── 5 TOP STATISTICAL KPI CARDS ───────────────────────────── */}
        <div className="admin-kpi-grid-5 animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          
          <div className="kpi-card border-indigo">
            <div className="kpi-icon-wrap bg-indigo-light">
              <Users size={24} color="#4F46E5" />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Registered Users</span>
              <h3 className="kpi-value">{stats?.totalUsers || 0}</h3>
            </div>
          </div>

          <div className="kpi-card border-teal">
            <div className="kpi-icon-wrap bg-teal-light">
              <UserCheck size={24} color="#10B981" />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Active Users</span>
              <h3 className="kpi-value">{stats?.activeUsers || 0}</h3>
            </div>
          </div>

          <div className="kpi-card border-amber">
            <div className="kpi-icon-wrap bg-amber-light">
              <Clock size={24} color="#F59E0B" />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">With Open Tickets</span>
              <h3 className="kpi-value">{stats?.usersWithOpenTickets || 0}</h3>
            </div>
          </div>

          <div className="kpi-card border-blue">
            <div className="kpi-icon-wrap bg-blue-light">
              <CheckCircle2 size={24} color="#3B82F6" />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">With Resolved Tickets</span>
              <h3 className="kpi-value">{stats?.usersWithResolvedTickets || 0}</h3>
            </div>
          </div>

          <div className="kpi-card border-purple">
            <div className="kpi-icon-wrap bg-purple-light">
              <Calendar size={24} color="#8B5CF6" />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">New This Month</span>
              <h3 className="kpi-value">{stats?.newUsersThisMonth || 0}</h3>
            </div>
          </div>

        </div>

        {/* ── FILTER & SEARCH BAR ─────────────────────────────────────── */}
        <div className="my-tickets-filter-bar animate-slide-up">
          <div className="filter-item-wrap search-flex">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search user name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-item-wrap">
            <Filter size={15} color="var(--text-muted)" />
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>Dept: {dept}</option>
              ))}
            </select>
          </div>

          <div className="filter-item-wrap">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="All">Role: All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="filter-item-wrap">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">Status: All Statuses</option>
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

          <div className="filter-item-wrap">
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_tickets">Most Tickets</option>
              <option value="least_tickets">Least Tickets</option>
            </select>
          </div>
        </div>

        {/* ── USERS DATA TABLE ────────────────────────────────────────── */}
        {loading ? (
          <div className="skeleton-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : (
          <div className="admin-table-card animate-slide-up">
            <div className="table-responsive-wrap">
              <table className="admin-tickets-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Total Tickets</th>
                    <th>Open</th>
                    <th>Resolved</th>
                    <th>Last Login</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '3rem' }}>
                        No registered users match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    sortedUsers.map((u) => {
                      const userInitials = u.name
                        ? u.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                        : 'US';

                      const isDisabled = u.status === 'Disabled';

                      return (
                        <tr key={u.id} style={{ opacity: isDisabled ? 0.6 : 1 }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                                {userInitials}
                              </div>
                              <strong>{u.name}</strong>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                          <td>{u.department || 'IT Infrastructure'}</td>
                          <td>
                            <span className={`badge-tag ${u.role === 'admin' ? 'tag-purple' : 'tag-blue'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td><strong>{u.total_tickets || 0}</strong></td>
                          <td><span style={{ color: '#F59E0B', fontWeight: 700 }}>{u.open_tickets || 0}</span></td>
                          <td><span style={{ color: '#10B981', fontWeight: 700 }}>{u.resolved_tickets || 0}</span></td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(u.last_login || u.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <span className={`status-pill ${isDisabled ? 'status-disabled' : 'status-active'}`}>
                              ● {u.status || 'Active'}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions-group">
                              <button
                                className="action-icon-btn action-view"
                                onClick={() => handleOpenUserDetail(u)}
                                title="View Profile & Tickets"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                className="action-icon-btn action-assign"
                                onClick={() => {
                                  setEditingUser(u);
                                  setEditDept(u.department || 'IT Infrastructure');
                                  setEditRole(u.role || 'user');
                                  setEditStatus(u.status || 'Active');
                                }}
                                title="Edit User"
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                className={`action-icon-btn ${isDisabled ? 'action-resolve' : 'action-close'}`}
                                onClick={() => handleToggleUserStatus(u)}
                                title={isDisabled ? 'Enable User' : 'Disable User'}
                              >
                                {isDisabled ? <UserCheck size={15} /> : <UserX size={15} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ═════════════════════════════════════════════════════════════════
          USER DETAILS SLIDE-OVER PANEL / MODAL
         ═════════════════════════════════════════════════════════════════ */}
      {selectedUserDetail && (
        <div className="modal-overlay" onClick={() => setSelectedUserDetail(null)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '900px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="user-avatar" style={{ width: '44px', height: '44px', fontSize: '1.1rem' }}>
                  {selectedUserDetail.user?.name
                    ? selectedUserDetail.user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'US'}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedUserDetail.user?.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedUserDetail.user?.email}</span>
                </div>
              </div>

              <button className="modal-close-btn" onClick={() => setSelectedUserDetail(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              
              {/* Profile Details Grid */}
              <div className="profile-details-grid" style={{ padding: 0, marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="detail-item">
                  <Building2 className="detail-icon" size={16} />
                  <div>
                    <span className="detail-label">Department</span>
                    <strong className="detail-value">{selectedUserDetail.user?.department || 'IT Infrastructure'}</strong>
                  </div>
                </div>

                <div className="detail-item">
                  <Shield className="detail-icon" size={16} />
                  <div>
                    <span className="detail-label">Role</span>
                    <strong className="detail-value">{selectedUserDetail.user?.role}</strong>
                  </div>
                </div>

                <div className="detail-item">
                  <Phone className="detail-icon" size={16} />
                  <div>
                    <span className="detail-label">Phone</span>
                    <strong className="detail-value">{selectedUserDetail.user?.phone && selectedUserDetail.user.phone.trim() ? selectedUserDetail.user.phone : 'Not Added'}</strong>
                  </div>
                </div>

                <div className="detail-item">
                  <Calendar className="detail-icon" size={16} />
                  <div>
                    <span className="detail-label">Joined Date</span>
                    <strong className="detail-value">{new Date(selectedUserDetail.user?.created_at).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>

              {/* User Ticket Stats Cards */}
              <h4 style={{ marginBottom: '0.75rem' }}>User Ticket Statistics</h4>
              <div className="profile-stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="p-stat-card border-indigo">
                  <div className="p-stat-icon bg-indigo-light"><Ticket size={20} color="#4F46E5" /></div>
                  <div>
                    <span className="p-stat-label">Total</span>
                    <h4 className="p-stat-val">{selectedUserDetail.stats?.total || 0}</h4>
                  </div>
                </div>

                <div className="p-stat-card border-amber">
                  <div className="p-stat-icon bg-amber-light"><Clock size={20} color="#F59E0B" /></div>
                  <div>
                    <span className="p-stat-label">Open</span>
                    <h4 className="p-stat-val">{selectedUserDetail.stats?.open || 0}</h4>
                  </div>
                </div>

                <div className="p-stat-card border-teal">
                  <div className="p-stat-icon bg-teal-light"><CheckCircle2 size={20} color="#10B981" /></div>
                  <div>
                    <span className="p-stat-label">Resolved</span>
                    <h4 className="p-stat-val">{selectedUserDetail.stats?.resolved || 0}</h4>
                  </div>
                </div>

                <div className="p-stat-card border-purple">
                  <div className="p-stat-icon bg-purple-light"><Bot size={20} color="#8B5CF6" /></div>
                  <div>
                    <span className="p-stat-label">AI Assisted</span>
                    <h4 className="p-stat-val">{selectedUserDetail.stats?.aiSolved || 0}</h4>
                  </div>
                </div>
              </div>

              {/* User Tickets Table */}
              <h4 style={{ marginBottom: '0.75rem' }}>Tickets Raised By This User</h4>
              {loadingUserTickets ? (
                <div className="loader" style={{ margin: '2rem auto' }} />
              ) : userTickets.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', background: '#F8FAFC', borderRadius: '12px' }}>
                  No tickets raised by this user yet.
                </p>
              ) : (
                <div className="table-responsive-wrap">
                  <table className="admin-tickets-table">
                    <thead>
                      <tr>
                        <th>Ticket #</th>
                        <th>Title</th>
                        <th>Department</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Assigned Engineer</th>
                        <th>AI Assisted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTickets.map((t) => (
                        <tr key={t.id}>
                          <td className="tkt-num-cell">{t.ticket_number || `TKT-${String(t.id).padStart(6, '0')}`}</td>
                          <td style={{ maxWidth: '200px' }} className="truncate-text">{t.issue_title}</td>
                          <td>{t.department || t.category}</td>
                          <td><PriorityBadge priority={t.priority} /></td>
                          <td><StatusBadge status={t.status} /></td>
                          <td>{t.assigned_to || 'Unassigned'}</td>
                          <td>
                            <span className="badge-tag tag-blue">
                              {t.ticket_source?.includes('AI') ? 'Yes 🤖' : 'No'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-primary btn-xs"
                              onClick={() => setSelectedTicket(t)}
                            >
                              <Eye size={12} /> View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          EDIT USER MODAL
         ═════════════════════════════════════════════════════════════════ */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Edit3 size={20} color="var(--primary)" /> Edit User: {editingUser.name}</h3>
              <button className="modal-close-btn" onClick={() => setEditingUser(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Department</label>
                  <select value={editDept} onChange={(e) => setEditDept(e.target.value)}>
                    {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Account Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn-primary">
                  <Save size={16} /> Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
