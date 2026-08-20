import React, { useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import TicketDetailModal from '../components/TicketDetailModal';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { ticketsAPI } from '../services/api';
import {
  History, Eye, Search, Filter, Cpu, Calendar, UserCheck, ArrowUpDown, RefreshCcw
} from 'lucide-react';

const DEPARTMENTS = [
  'All Departments',
  'IT Infrastructure',
  'Software & Apps',
  'Hardware & Devices',
  'Network & VPN',
  'Email & Office 365',
  'Accounts & Security',
  'HR & Payroll',
  'General IT Support'
];

const TicketHistory = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await ticketsAPI.getMine();
        setTickets(data);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    // Status filter
    const statusLower = (t.status || 'Open').toLowerCase();
    let matchesStatus = true;
    if (statusFilter === 'open') {
      matchesStatus = statusLower === 'open' || statusLower === 'pending';
    } else if (statusFilter === 'in_progress') {
      matchesStatus = statusLower === 'in_progress' || statusLower === 'in progress';
    } else if (statusFilter === 'resolved') {
      matchesStatus = statusLower === 'resolved';
    }

    // Priority filter
    const prioLower = (t.priority || 'medium').toLowerCase();
    const matchesPriority =
      priorityFilter === 'all' || prioLower === priorityFilter.toLowerCase();

    // Department filter
    const matchesDept =
      departmentFilter === 'All Departments' ||
      (t.department || t.category || '').toLowerCase() === departmentFilter.toLowerCase();

    // Search query
    const matchesSearch =
      search.trim() === '' ||
      (t.issue_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.ticket_number || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesPriority && matchesDept && matchesSearch;
  });

  // Sort by date
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDepartmentFilter('All Departments');
    setSortOrder('newest');
  };

  return (
    <UserLayout activeTab="my-tickets">
      <div className="admin-dashboard-container animate-fade-in">
        <div className="admin-header-title-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #EEF2FF' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <History size={24} color="var(--primary)" /> My Support Tickets
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>View, filter, and track status updates for all your submitted IT support cases.</p>
          </div>

          <button className="btn-outline btn-sm" onClick={handleClearFilters}>
            <RefreshCcw size={14} /> Reset Filters
          </button>
        </div>

        {/* ── Filter Bar Controls ──────────────────────────────────────── */}
        <div className="my-tickets-filter-bar animate-slide-up">
          {/* Search Box */}
          <div className="filter-item-wrap search-flex">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search ticket # or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="filter-item-wrap">
            <Filter size={15} color="var(--text-muted)" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="filter-item-wrap">
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="filter-item-wrap">
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="filter-item-wrap">
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* ── Ticket Grid / List ───────────────────────────────────────── */}
        {loading ? (
          <div className="skeleton-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : sortedTickets.length === 0 ? (
          <div className="empty-history-box animate-fade-in">
            <History size={48} color="var(--text-muted)" />
            <h3>No Tickets Found</h3>
            <p>No support tickets match your selected search criteria or filters.</p>
          </div>
        ) : (
          <div className="tickets-grid-list animate-slide-up">
            {sortedTickets.map((ticket) => {
              const ticketNum = ticket.ticket_number || `TKT-${String(ticket.id).padStart(6, '0')}`;
              const assignedEngineer = ticket.assigned_to || 'Unassigned';

              return (
                <div
                  key={ticket.id}
                  className="history-ticket-card"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="htc-top">
                    <span className="htc-num">{ticketNum}</span>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>

                  <h3 className="htc-title">{ticket.issue_title}</h3>

                  <div className="htc-meta">
                    <span>🏢 {ticket.department}</span>
                    <span><Calendar size={14} /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                    <span><UserCheck size={14} color="#3B82F6" /> Engineer: <strong>{assignedEngineer}</strong></span>
                  </div>

                  <div className="htc-bottom">
                    <button
                      className="btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicket(ticket);
                      }}
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </div>
    </UserLayout>
  );
};

export default TicketHistory;
