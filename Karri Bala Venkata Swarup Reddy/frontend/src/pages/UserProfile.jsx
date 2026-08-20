import React, { useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import { useAuth } from '../context/AuthContext';
import { ticketsAPI } from '../services/api';
import {
  User, Mail, Phone, Building2, Shield, Calendar, Edit3, Save, X,
  Check, Lock, Ticket, CheckCircle2, Bot, Clock, KeyRound
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

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [stats, setStats] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || 'IT Infrastructure');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await ticketsAPI.getMineStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching profile stats:', err);
      }
    };
    fetchStats();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleEditClick = () => {
    setName(user?.name || '');
    setDepartment(user?.department || 'IT Infrastructure');
    setPhone(user?.phone || '');
    setErrorMessage('');
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setErrorMessage('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSaving(true);

    try {
      await updateProfile({
        name,
        department,
        phone
      });

      setIsEditing(false);
      showToast('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    setShowPasswordModal(false);
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password changed successfully.');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  const formattedDisplayPhone = user?.phone && user.phone.trim() ? user.phone : 'Not Added';

  return (
    <UserLayout activeTab="profile">
      <div className="admin-dashboard-container animate-fade-in">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="profile-toast animate-slide-up">
            <Check size={18} color="#10B981" /> {toastMessage}
          </div>
        )}

        <div className="profile-page-wrapper animate-fade-in">
          
          {/* Main User Card */}
          <div className="profile-card main-profile-card">
            <div className="profile-header-bg"></div>
            
            <div className="profile-avatar-area">
              <div className="profile-avatar-lg">{initials}</div>
              <div className="profile-title-area">
                <h2>{user?.name || 'Enterprise User'}</h2>
                <span className="profile-role-tag">
                  <Shield size={14} /> {user?.role === 'admin' || user?.role === 'superadmin' ? 'Administrator' : 'Enterprise User'}
                </span>
              </div>
            </div>

            <div className="profile-details-grid">
              {!isEditing ? (
                <>
                  <div className="detail-item">
                    <User className="detail-icon" size={18} />
                    <div>
                      <span className="detail-label">Full Name</span>
                      <strong className="detail-value">{user?.name}</strong>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Mail className="detail-icon" size={18} />
                    <div>
                      <span className="detail-label">Email Address</span>
                      <strong className="detail-value">{user?.email}</strong>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Building2 className="detail-icon" size={18} />
                    <div>
                      <span className="detail-label">Department</span>
                      <strong className="detail-value">{user?.department || 'IT Infrastructure'}</strong>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Phone className="detail-icon" size={18} />
                    <div>
                      <span className="detail-label">Phone Number</span>
                      <strong className="detail-value" style={{ color: formattedDisplayPhone === 'Not Added' ? 'var(--text-placeholder)' : 'var(--text-main)' }}>
                        {formattedDisplayPhone}
                      </strong>
                    </div>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveProfile} style={{ gridColumn: '1 / -1' }}>
                  {errorMessage && (
                    <div className="auth-error" style={{ marginBottom: '1rem' }}>
                      {errorMessage}
                    </div>
                  )}

                  <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Department</label>
                      <select value={department} onChange={(e) => setDepartment(e.target.value)}>
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" className="btn-primary" disabled={isSaving}>
                      <Save size={16} /> Save Changes
                    </button>
                    <button type="button" className="btn-outline" onClick={handleCancelClick}>
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {!isEditing && (
              <div className="profile-action-bar">
                <button className="btn-primary btn-sm" onClick={handleEditClick}>
                  <Edit3 size={16} /> Edit Profile
                </button>

                <button className="btn-outline btn-sm" onClick={() => setShowPasswordModal(true)}>
                  <Lock size={16} /> Change Password
                </button>
              </div>
            )}
          </div>

          {/* User Performance Stats */}
          <div className="profile-stats-section">
            <h3>Support Metrics & Activity Overview</h3>
            <div className="profile-stats-grid">
              <div className="p-stat-card border-indigo">
                <div className="p-stat-icon bg-indigo-light">
                  <Ticket size={24} color="#4F46E5" />
                </div>
                <div>
                  <span className="p-stat-label">Total Tickets Raised</span>
                  <h4 className="p-stat-val">{stats?.total || 0}</h4>
                </div>
              </div>

              <div className="p-stat-card border-amber">
                <div className="p-stat-icon bg-amber-light">
                  <Clock size={24} color="#F59E0B" />
                </div>
                <div>
                  <span className="p-stat-label">Open Tickets</span>
                  <h4 className="p-stat-val">{stats?.pending || 0}</h4>
                </div>
              </div>

              <div className="p-stat-card border-teal">
                <div className="p-stat-icon bg-teal-light">
                  <CheckCircle2 size={24} color="#10B981" />
                </div>
                <div>
                  <span className="p-stat-label">Resolved Tickets</span>
                  <h4 className="p-stat-val">{stats?.resolved || 0}</h4>
                </div>
              </div>

              <div className="p-stat-card border-purple">
                <div className="p-stat-icon bg-purple-light">
                  <Bot size={24} color="#8B5CF6" />
                </div>
                <div>
                  <span className="p-stat-label">AI Assisted</span>
                  <h4 className="p-stat-val">{stats?.aiSolved || 0}</h4>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal-content animate-slide-up" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3><KeyRound size={20} color="var(--primary)" /> Change Password</h3>
                <button className="modal-close-btn" onClick={() => setShowPasswordModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit}>
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

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="submit" className="btn-primary">Update Password</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </UserLayout>
  );
};

export default UserProfile;
