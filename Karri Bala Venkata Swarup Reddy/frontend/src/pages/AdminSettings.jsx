import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { adminManagementAPI } from '../services/api';
import {
  Settings, ShieldAlert, ShieldCheck, Shield, UserPlus, Trash2, Edit3, KeyRound,
  UserX, UserCheck, RefreshCcw, CheckCircle2, AlertTriangle, Eye, X, Save,
  Lock, Mail, Phone, Building2, User
} from 'lucide-react';

const DEPARTMENTS = [
  'IT Infrastructure',
  'Software & Apps',
  'Hardware & Devices',
  'Network & VPN',
  'Email & Office 365',
  'Accounts & Security',
  'HR & Payroll',
  'General IT Support'
];

const AdminSettings = () => {
  const { user } = useAuth();
  
  // Super Admin check
  const isSuperAdmin =
    user?.role === 'superadmin' ||
    user?.email === 'swarupchiru@gmail.com' ||
    user?.email === 'admin@sams.com';

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Create Admin Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [createError, setCreateError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Admin Modal State
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('admin');
  const [editStatus, setEditStatus] = useState('Active');

  // Reset Password Modal State
  const [resetPassAdmin, setResetPassAdmin] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Delete Admin Confirmation State
  const [deletingAdmin, setDeletingAdmin] = useState(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminManagementAPI.getAll();
      setAdmins(data);
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const showSuccessToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Reset Create Form
  const handleResetCreateForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDepartment('');
    setPassword('');
    setConfirmPassword('');
    setRole('admin');
    setCreateError('');
  };

  // Handle Create Admin
  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!department) {
      setCreateError('Please select a department.');
      return;
    }

    if (password !== confirmPassword) {
      setCreateError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setCreateError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      await adminManagementAPI.create({
        name,
        email,
        phone,
        department,
        password,
        role
      });

      handleResetCreateForm();
      showSuccessToast('Administrator created successfully.');
      fetchAdmins();
    } catch (err) {
      console.error('Create admin failed:', err);
      setCreateError(err.response?.data?.message || 'Failed to create administrator.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Admin Submit
  const handleEditAdminSubmit = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;

    try {
      await adminManagementAPI.update(editingAdmin.id, {
        name: editName,
        department: editDept,
        phone: editPhone,
        role: editRole,
        status: editStatus
      });
      setEditingAdmin(null);
      showSuccessToast('Administrator account updated successfully.');
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update administrator.');
    }
  };

  // Handle Toggle Enable/Disable Status
  const handleToggleAdminStatus = async (adminObj) => {
    const isSuper = adminObj.email === 'swarupchiru@gmail.com' || adminObj.role === 'superadmin';
    if (isSuper) {
      alert('The Super Admin account cannot be disabled.');
      return;
    }

    const newStatus = adminObj.status === 'Disabled' ? 'Active' : 'Disabled';

    try {
      await adminManagementAPI.update(adminObj.id, { status: newStatus });
      showSuccessToast(`Administrator status changed to ${newStatus}.`);
      fetchAdmins();
    } catch (err) {
      alert('Failed to update administrator status.');
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetPassAdmin) return;

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    try {
      await adminManagementAPI.resetPassword(resetPassAdmin.id, newPassword);
      setResetPassAdmin(null);
      setNewPassword('');
      showSuccessToast(`Password reset successfully for ${resetPassAdmin.name}.`);
    } catch (err) {
      alert('Failed to reset password.');
    }
  };

  // Handle Delete Admin Confirm
  const handleConfirmDeleteAdmin = async () => {
    if (!deletingAdmin) return;

    try {
      await adminManagementAPI.delete(deletingAdmin.id);
      setDeletingAdmin(null);
      showSuccessToast('Administrator account deleted successfully.');
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete administrator account.');
      setDeletingAdmin(null);
    }
  };

  return (
    <AdminLayout activeTab="settings">
      <div className="admin-dashboard-container animate-fade-in">

        {/* Top Notification Toast */}
        {notification && (
          <div className="profile-toast animate-slide-up">
            <CheckCircle2 size={18} color="#10B981" /> {notification}
          </div>
        )}

        {/* Header Title Bar */}
        <div className="admin-header-title-bar">
          <div>
            <h1><Settings size={26} color="var(--primary)" /> Portal Settings & Admin Management</h1>
            <p>Configure enterprise system preferences and manage administrator access roles.</p>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            SUPER ADMIN ACCESS RESTRICTION NOTICE (IF REGULAR ADMIN)
           ═════════════════════════════════════════════════════════════════ */}
        {!isSuperAdmin ? (
          <div className="admin-table-card animate-slide-up" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <ShieldAlert size={48} color="#F59E0B" style={{ margin: '0 auto 1rem' }} />
            <h2>Super Admin Access Required</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0.5rem auto 1.5rem' }}>
              The <strong>Admin Management</strong> module is restricted to the Super Admin account. Regular administrators have full access to Dashboard, All Tickets Queue, and User Directory.
            </p>
          </div>
        ) : (
          /* ═════════════════════════════════════════════════════════════════
              SUPER ADMIN MANAGEMENT MODULE
             ═════════════════════════════════════════════════════════════════ */
          <div className="admin-management-module-wrapper">

            {/* ── SECTION 1: CREATE ADMIN FORM ─────────────────────────── */}
            <div className="admin-table-card animate-slide-up" style={{ marginBottom: '2rem' }}>
              <div className="table-card-header">
                <h3><UserPlus size={20} color="var(--primary)" /> Create Administrator Account</h3>
                <span className="badge-tag tag-purple">Super Admin Exclusive</span>
              </div>

              {createError && <div className="auth-error" style={{ marginBottom: '1rem' }}>{createError}</div>}

              <form onSubmit={handleCreateAdminSubmit}>
                <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Department</label>
                    <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Role</label>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.7rem 1rem', borderRadius: '8px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={16} color="var(--primary)" /> Admin (Standard Administrator)
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    <UserPlus size={18} /> Create Admin
                  </button>
                  
                  <button type="button" className="btn-outline" onClick={handleResetCreateForm}>
                    <RefreshCcw size={16} /> Reset
                  </button>
                </div>
              </form>
            </div>

            {/* ── SECTION 2: ADMIN LIST TABLE ─────────────────────────── */}
            <div className="admin-table-card animate-slide-up">
              <div className="table-card-header">
                <div>
                  <h3><ShieldCheck size={20} color="var(--primary)" /> Administrator Accounts Directory</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>List of all enterprise administrators and Super Admin accounts</p>
                </div>
                <button className="btn-outline btn-sm" onClick={fetchAdmins}>
                  <RefreshCcw size={14} /> Refresh List
                </button>
              </div>

              {loading ? (
                <div className="skeleton-grid">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-card" />
                  ))}
                </div>
              ) : (
                <div className="table-responsive-wrap">
                  <table className="admin-tickets-table">
                    <thead>
                      <tr>
                        <th>Administrator</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((a) => {
                        const adminInitials = a.name
                          ? a.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                          : 'SA';
                        
                        const isSuper = a.email === 'swarupchiru@gmail.com' || a.role === 'superadmin';
                        const isDisabled = a.status === 'Disabled';

                        return (
                          <tr key={a.id} style={{ opacity: isDisabled ? 0.6 : 1 }}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div className="user-avatar" style={{ width: '36px', height: '36px', background: isSuper ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : '#1E1B4B' }}>
                                  {adminInitials}
                                </div>
                                <strong>{a.name}</strong>
                              </div>
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>{a.email}</td>
                            <td style={{ fontSize: '0.85rem' }}>{a.phone && a.phone.trim() ? a.phone : 'Not Added'}</td>
                            <td>{a.department || 'IT Administration'}</td>
                            <td>
                              <span className={`badge-tag ${isSuper ? 'tag-purple' : 'tag-indigo'}`}>
                                {isSuper ? '👑 Super Admin' : 'Admin'}
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill ${isDisabled ? 'status-disabled' : 'status-active'}`}>
                                ● {a.status || 'Active'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {new Date(a.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {new Date(a.last_login || a.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="table-actions-group">
                                
                                {/* Edit Admin */}
                                <button
                                  className="action-icon-btn action-view"
                                  onClick={() => {
                                    setEditingAdmin(a);
                                    setEditName(a.name);
                                    setEditDept(a.department || 'IT Administration');
                                    setEditPhone(a.phone || '');
                                    setEditRole(a.role || 'admin');
                                    setEditStatus(a.status || 'Active');
                                  }}
                                  title="Edit Admin"
                                >
                                  <Edit3 size={15} />
                                </button>

                                {/* Reset Password */}
                                <button
                                  className="action-icon-btn action-assign"
                                  onClick={() => {
                                    setResetPassAdmin(a);
                                    setNewPassword('');
                                  }}
                                  title="Reset Password"
                                >
                                  <KeyRound size={15} />
                                </button>

                                {/* Disable / Enable Admin */}
                                <button
                                  className={`action-icon-btn ${isDisabled ? 'action-resolve' : 'action-close'}`}
                                  onClick={() => handleToggleAdminStatus(a)}
                                  disabled={isSuper}
                                  title={isSuper ? 'Super Admin cannot be disabled' : (isDisabled ? 'Enable Admin' : 'Disable Admin')}
                                >
                                  {isDisabled ? <UserCheck size={15} /> : <UserX size={15} />}
                                </button>

                                {/* Delete Admin */}
                                <button
                                  className="action-icon-btn action-close"
                                  onClick={() => setDeletingAdmin(a)}
                                  disabled={isSuper}
                                  title={isSuper ? 'Super Admin cannot be deleted' : 'Delete Admin'}
                                >
                                  <Trash2 size={15} color={isSuper ? '#9CA3AF' : '#EF4444'} />
                                </button>

                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ═════════════════════════════════════════════════════════════════
          EDIT ADMIN MODAL
         ═════════════════════════════════════════════════════════════════ */}
      {editingAdmin && (
        <div className="modal-overlay" onClick={() => setEditingAdmin(null)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Edit3 size={20} color="var(--primary)" /> Edit Administrator: {editingAdmin.name}</h3>
              <button className="modal-close-btn" onClick={() => setEditingAdmin(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditAdminSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <select value={editDept} onChange={(e) => setEditDept(e.target.value)}>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="Enter 10-digit mobile number"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.7rem 1rem', borderRadius: '8px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={16} color="var(--primary)" /> {editingAdmin.email === 'swarupchiru@gmail.com' || editingAdmin.role === 'superadmin' ? '👑 Super Admin' : 'Admin (Standard Administrator)'}
                  </div>
                </div>

                <div className="form-group">
                  <label>Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    disabled={editingAdmin.email === 'swarupchiru@gmail.com'}
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn-primary">
                  <Save size={16} /> Save Admin Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          RESET PASSWORD MODAL
         ═════════════════════════════════════════════════════════════════ */}
      {resetPassAdmin && (
        <div className="modal-overlay" onClick={() => setResetPassAdmin(null)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><KeyRound size={20} color="var(--primary)" /> Reset Password: {resetPassAdmin.name}</h3>
              <button className="modal-close-btn" onClick={() => setResetPassAdmin(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          DELETE ADMIN CONFIRMATION DIALOG MODAL
         ═════════════════════════════════════════════════════════════════ */}
      {deletingAdmin && (
        <div className="modal-overlay" onClick={() => setDeletingAdmin(null)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '440px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '2rem 1.5rem' }}>
              <AlertTriangle size={48} color="#EF4444" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Delete Administrator?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
                This action will permanently remove the administrator account for <strong>{deletingAdmin.name}</strong> ({deletingAdmin.email}).
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-outline" onClick={() => setDeletingAdmin(null)}>
                  Cancel
                </button>
                <button className="btn-danger-outline" style={{ background: '#EF4444', color: 'white', border: 'none' }} onClick={handleConfirmDeleteAdmin}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminSettings;
