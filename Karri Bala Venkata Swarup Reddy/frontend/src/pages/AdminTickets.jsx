import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import FilterBar from '../components/FilterBar';
import TicketDetailModal from '../components/TicketDetailModal';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { ticketsAPI } from '../services/api';
import { Layers, Eye, UserCheck, Check, X, RefreshCcw } from 'lucide-react';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assigningTicketId, setAssigningTicketId] = useState(null);
  const [engineerNameInput, setEngineerNameInput] = useState('Engineer David');

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    department: ''
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ticketsAPI.getAll(filters);
      setTickets(data);
    } catch (error) {
      console.error('Error fetching admin tickets', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleResolve = async (id) => {
    try {
      await ticketsAPI.resolve(id);
      fetchTickets();
    } catch (error) {
      alert('Failed to resolve ticket');
    }
  };

  const handleAssign = async (id) => {
    try {
      await ticketsAPI.assign(id, engineerNameInput);
      setAssigningTicketId(null);
      fetchTickets();
    } catch (error) {
      alert('Failed to assign ticket');
    }
  };

  const handleClose = async (id) => {
    try {
      await ticketsAPI.close(id);
      fetchTickets();
    } catch (error) {
      alert('Failed to close ticket');
    }
  };

  const handleClear = () => {
    setFilters({ search: '', status: '', priority: '', department: '' });
  };

  return (
    <AdminLayout activeTab="tickets">
      <div className="admin-dashboard-container animate-fade-in">
        
        <div className="admin-header-title-bar">
          <div>
            <h1><Layers size={24} color="var(--primary)" /> All Support Tickets</h1>
            <p>Manage, filter, assign, and resolve tickets across all organizational departments.</p>
          </div>

          <button className="btn-outline btn-sm" onClick={fetchTickets}>
            <RefreshCcw size={16} /> Refresh List
          </button>
        </div>

        <div className="animate-slide-up" style={{ marginBottom: '1.5rem' }}>
          <FilterBar filters={filters} setFilters={setFilters} onClear={handleClear} onRefresh={fetchTickets} />
        </div>

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
                    <th>Ticket ID</th>
                    <th>User</th>
                    <th>Issue Title</th>
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
                      <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                        No tickets match your selected filters.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t) => {
                      const ticketNum = t.ticket_number || `TKT-${String(t.id).padStart(6, '0')}`;
                      const isAssigning = assigningTicketId === t.id;

                      return (
                        <tr key={t.id}>
                          <td className="tkt-num-cell">{ticketNum}</td>
                          <td><strong>{t.raised_by_name || 'User'}</strong></td>
                          <td style={{ maxWidth: '240px' }} className="truncate-text">{t.issue_title}</td>
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
                                <button className="btn-primary btn-xs" onClick={() => handleAssign(t.id)}>Save</button>
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
                                  onClick={() => handleResolve(t.id)}
                                  title="Resolve Ticket"
                                >
                                  <Check size={15} />
                                </button>
                              )}

                              <button
                                className="action-icon-btn action-close"
                                onClick={() => handleClose(t.id)}
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
        )}

      </div>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminTickets;
