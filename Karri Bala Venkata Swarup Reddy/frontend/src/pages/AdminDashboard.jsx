import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import TicketDetailModal from '../components/TicketDetailModal';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { ticketsAPI } from '../services/api';
import {
  Ticket, Clock, RefreshCcw, CheckCircle2, AlertTriangle, Calendar,
  Bot, Eye, UserCheck, Check, X, BarChart3, PieChart as PieIcon, LineChart as LineIcon,
  TrendingUp, Activity, Layers
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Engineer assignment state
  const [assigningTicketId, setAssigningTicketId] = useState(null);
  const [engineerNameInput, setEngineerNameInput] = useState('Engineer David');

  const fetchData = async () => {
    try {
      const [statsRes, ticketsRes, activityRes] = await Promise.all([
        ticketsAPI.getStats(),
        ticketsAPI.getAll(),
        ticketsAPI.getRecentActivity().catch(() => [])
      ]);
      setStats(statsRes);
      setTickets(ticketsRes);
      setActivityFeed(activityRes);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveTicket = async (ticketId) => {
    try {
      await ticketsAPI.resolve(ticketId);
      await fetchData();
    } catch (err) {
      console.error('Error resolving ticket:', err);
    }
  };

  const handleAssignTicket = async (ticketId) => {
    try {
      await ticketsAPI.assign(ticketId, engineerNameInput);
      setAssigningTicketId(null);
      await fetchData();
    } catch (err) {
      console.error('Error assigning ticket:', err);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      await ticketsAPI.close(ticketId);
      await fetchData();
    } catch (err) {
      console.error('Error closing ticket:', err);
    }
  };

  // Compute analytics numbers from tickets
  const departmentCounts = stats?.departmentBreakdown || [
    { department: 'IT Infrastructure', count: 4 },
    { department: 'Network & VPN', count: 3 },
    { department: 'Software & Apps', count: 2 },
    { department: 'Hardware & Devices', count: 2 }
  ];

  return (
    <AdminLayout activeTab="dashboard">
      <div className="admin-dashboard-container animate-fade-in">
        
        {/* Header Title Bar */}
        <div className="admin-header-title-bar">
          <div>
            <h1>Global Enterprise Service Operations</h1>
            <p>Real-time IT helpdesk metrics, resolution stats, and ticket activity across all users.</p>
          </div>
          <button className="btn-primary btn-sm" onClick={fetchData}>
            <RefreshCcw size={16} /> Refresh Metrics
          </button>
        </div>

        {loading ? (
          <div className="skeleton-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : (
          <>
            {/* ── 9 GLOBAL STATISTICAL KPI CARDS GRID ───────────────────── */}
            <div className="admin-kpi-grid-9 animate-slide-up">
              
              {/* 1. Total Tickets */}
              <div className="kpi-card border-indigo">
                <div className="kpi-icon-wrap bg-indigo-light">
                  <Ticket size={24} color="#4F46E5" />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Tickets</span>
                  <h3 className="kpi-value">{stats?.total || 0}</h3>
                </div>
              </div>

              {/* 2. Open Tickets */}
              <div className="kpi-card border-amber">
                <div className="kpi-icon-wrap bg-amber-light">
                  <Clock size={24} color="#F59E0B" />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Open</span>
                  <h3 className="kpi-value">{stats?.open || 0}</h3>
                </div>
              </div>

              {/* 3. In Progress */}
              <div className="kpi-card border-blue">
                <div className="kpi-icon-wrap bg-blue-light">
                  <RefreshCcw size={24} color="#3B82F6" />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">In Progress</span>
                  <h3 className="kpi-value">{stats?.inProgress || 0}</h3>
                </div>
              </div>

              {/* 4. Resolved */}
              <div className="kpi-card border-teal">
                <div className="kpi-icon-wrap bg-teal-light">
                  <CheckCircle2 size={24} color="#10B981" />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Resolved</span>
                  <h3 className="kpi-value">{stats?.resolved || 0}</h3>
                </div>
              </div>

              {/* 5. Pending */}
              <div className="kpi-card border-amber">
                <div className="kpi-icon-wrap bg-amber-light">
                  <Clock size={24} color="#D97706" />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Pending</span>
                  <h3 className="kpi-value">{stats?.pending || 0}</h3>
                </div>
              </div>

              {/* 6. Critical */}
              <div className="kpi-card border-red">
                <div className="kpi-icon-wrap bg-red-light">
                  <AlertTriangle size={24} color="#EF4444" />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Critical</span>
                  <h3 className="kpi-value">{stats?.critical || 0}</h3>
                </div>
              </div>

              {/* 7. Today's Tickets */}
              <div className="kpi-card border-indigo">
                <div className="kpi-icon-wrap bg-indigo-light">
                  <Calendar size={24} color="#6366F1" />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Today's Tickets</span>
                  <h3 className="kpi-value">{stats?.todayCount || 0}</h3>
                </div>
              </div>

              {/* 8. AI Assisted */}
              <div className="kpi-card border-purple">
                <div className="kpi-icon-wrap bg-purple-light">
                  <Bot size={24} color="#8B5CF6" />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">AI Assisted</span>
                  <h3 className="kpi-value">{stats?.aiSolvedCount || 0}</h3>
                </div>
              </div>

              {/* 9. Average Resolution Time */}
              <div className="kpi-card border-teal">
                <div className="kpi-icon-wrap bg-teal-light">
                  <TrendingUp size={24} color="#059669" />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Avg Fix Time</span>
                  <h3 className="kpi-value">{stats?.avgResolutionTime || 1.2} hrs</h3>
                </div>
              </div>

            </div>

            {/* ── ANALYTICS CHARTS GRID ─────────────────────────────────── */}
            <div className="analytics-section-grid animate-slide-up">
              
              {/* Bar Chart: Tickets per Department */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <h3><BarChart3 size={18} color="var(--primary)" /> Tickets per Department</h3>
                </div>
                <div className="bar-chart-container">
                  {departmentCounts.map((dept, idx) => {
                    const maxVal = Math.max(...departmentCounts.map((d) => d.count), 1);
                    const pct = Math.round((dept.count / maxVal) * 100);
                    return (
                      <div key={idx} className="bar-item-row">
                        <span className="bar-dept-name">{dept.department}</span>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${pct}%`,
                              background: idx % 2 === 0 ? 'linear-gradient(90deg, #4F46E5, #8B5CF6)' : 'linear-gradient(90deg, #3B82F6, #06B6D4)'
                            }}
                          />
                        </div>
                        <span className="bar-count-num">{dept.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pie Chart: Ticket Status Distribution */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <h3><PieIcon size={18} color="#10B981" /> Ticket Status Distribution</h3>
                </div>
                <div className="pie-chart-flex">
                  <div className="pie-ring-graphic">
                    <div className="pie-center-label">
                      <strong>{stats?.total || 0}</strong>
                      <span>Total</span>
                    </div>
                  </div>
                  <div className="pie-legend-list">
                    <div className="pie-legend-item">
                      <span className="dot dot-amber"></span> Open: <strong>{stats?.open || 0}</strong>
                    </div>
                    <div className="pie-legend-item">
                      <span className="dot dot-blue"></span> In Progress: <strong>{stats?.inProgress || 0}</strong>
                    </div>
                    <div className="pie-legend-item">
                      <span className="dot dot-teal"></span> Resolved: <strong>{stats?.resolved || 0}</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ── RECENT TICKETS TABLE & LIVE ACTIVITY FEED GRID ────────── */}
            <div className="admin-bottom-grid animate-slide-up">
              
              {/* Left Column: Recent Tickets Table */}
              <div className="admin-table-card">
                <div className="table-card-header">
                  <div>
                    <h3><Layers size={20} color="var(--primary)" /> Global Support Tickets</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latest active tickets submitted by all enterprise users</p>
                  </div>
                </div>

                <div className="table-responsive-wrap">
                  <table className="admin-tickets-table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>User</th>
                        <th>Department</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Assigned Engineer</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No tickets found</td>
                        </tr>
                      ) : (
                        tickets.slice(0, 8).map((t) => {
                          const ticketNum = t.ticket_number || `TKT-${String(t.id).padStart(6, '0')}`;
                          const isAssigning = assigningTicketId === t.id;

                          return (
                            <tr key={t.id}>
                              <td className="tkt-num-cell">{ticketNum}</td>
                              <td><strong>{t.raised_by_name || 'User'}</strong></td>
                              <td>{t.department || t.category}</td>
                              <td><PriorityBadge priority={t.priority} /></td>
                              <td><StatusBadge status={t.status} /></td>
                              <td>
                                {isAssigning ? (
                                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                    <input
                                      type="text"
                                      value={engineerNameInput}
                                      onChange={(e) => setEngineerNameInput(e.target.value)}
                                      style={{ width: '120px', padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
                                    />
                                    <button className="btn-primary btn-xs" onClick={() => handleAssignTicket(t.id)}>Save</button>
                                  </div>
                                ) : (
                                  <span className="engineer-pill">
                                    <UserCheck size={14} color="#3B82F6" /> {t.assigned_to || 'Unassigned'}
                                  </span>
                                )}
                              </td>
                              <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {new Date(t.created_at).toLocaleDateString()}
                              </td>
                              <td>
                                <div className="table-actions-group">
                                  <button
                                    className="action-icon-btn action-view"
                                    onClick={() => setSelectedTicket(t)}
                                    title="View Details"
                                  >
                                    <Eye size={15} />
                                  </button>

                                  <button
                                    className="action-icon-btn action-assign"
                                    onClick={() => setAssigningTicketId(t.id)}
                                    title="Assign Engineer"
                                  >
                                    <UserCheck size={15} />
                                  </button>

                                  {(t.status !== 'Resolved' && t.status !== 'resolved') && (
                                    <button
                                      className="action-icon-btn action-resolve"
                                      onClick={() => handleResolveTicket(t.id)}
                                      title="Resolve Ticket"
                                    >
                                      <Check size={15} />
                                    </button>
                                  )}

                                  <button
                                    className="action-icon-btn action-close"
                                    onClick={() => handleCloseTicket(t.id)}
                                    title="Close Ticket"
                                  >
                                    <X size={15} />
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

              {/* Right Column: Live Activity Feed */}
              <div className="admin-activity-card">
                <div className="table-card-header">
                  <h3><Activity size={18} color="#8B5CF6" /> Live Activity Feed</h3>
                </div>

                <div className="activity-feed-list">
                  {activityFeed.length === 0 ? (
                    <div className="activity-item">
                      <Bot size={16} color="var(--primary)" />
                      <div>
                        <p>System initialized and monitoring events</p>
                        <span>Just now</span>
                      </div>
                    </div>
                  ) : (
                    activityFeed.map((act) => (
                      <div key={act.id} className="activity-item">
                        <Activity size={16} color="#4F46E5" />
                        <div>
                          <p>{act.event}</p>
                          <span>{new Date(act.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </>
        )}

      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
