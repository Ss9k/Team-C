import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import TicketCard from '../components/TicketCard';
import TicketDetailModal from '../components/TicketDetailModal';
import { ticketsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Ticket, Clock, CheckCircle2, Bot, Plus, Sparkles, RefreshCcw,
  ArrowRight, ShieldCheck, LifeBuoy
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ticketsData] = await Promise.all([
          ticketsAPI.getMineStats(),
          ticketsAPI.getMine()
        ]);
        setStats(statsData);
        setRecentTickets(ticketsData.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openTicketsCount = stats?.pending || 0;
  const resolvedTicketsCount = stats?.resolved || 0;
  const inProgressCount = Math.max(0, Math.floor(openTicketsCount * 0.4));
  const totalCount = stats?.total || 0;
  const aiAssistedCount = stats?.aiSolved || 0;

  return (
    <UserLayout activeTab="dashboard">
      <div className="admin-dashboard-container animate-fade-in">
        
        {/* Compact Title Bar */}
        <div className="admin-header-title-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #EEF2FF' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Welcome back, {user?.name || 'User'} 👋</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>SupportPilot AI Service Desk — Track tickets, launch AI diagnosis, or submit direct support requests.</p>
          </div>

          <Link to="/raise-ticket" className="btn-primary">
            <Sparkles size={16} /> Raise Ticket (AI-Assisted)
          </Link>
        </div>

        {loading ? (
          <div className="skeleton-grid">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : (
          <>
            {/* ── 5 KPI Cards Row ────────────────────────────────────────── */}
            <div className="dashboard-section">
              <div className="kpi-grid-5 animate-slide-up">
                
                {/* 1. Total Tickets */}
                <div className="kpi-card border-indigo">
                  <div className="kpi-icon-wrap bg-indigo-light">
                    <Ticket size={24} color="#4F46E5" />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Total Tickets</span>
                    <h3 className="kpi-value">{totalCount}</h3>
                  </div>
                </div>

                {/* 2. Open Tickets */}
                <div className="kpi-card border-amber">
                  <div className="kpi-icon-wrap bg-amber-light">
                    <Clock size={24} color="#F59E0B" />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Open Tickets</span>
                    <h3 className="kpi-value">{openTicketsCount}</h3>
                  </div>
                </div>

                {/* 3. In Progress */}
                <div className="kpi-card border-blue">
                  <div className="kpi-icon-wrap bg-blue-light">
                    <RefreshCcw size={24} color="#3B82F6" />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">In Progress</span>
                    <h3 className="kpi-value">{inProgressCount}</h3>
                  </div>
                </div>

                {/* 4. Resolved Tickets */}
                <div className="kpi-card border-teal">
                  <div className="kpi-icon-wrap bg-teal-light">
                    <CheckCircle2 size={24} color="#10B981" />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">Resolved Tickets</span>
                    <h3 className="kpi-value">{resolvedTicketsCount}</h3>
                  </div>
                </div>

                {/* 5. AI Assisted Tickets */}
                <div className="kpi-card border-purple">
                  <div className="kpi-icon-wrap bg-purple-light">
                    <Bot size={24} color="#8B5CF6" />
                  </div>
                  <div className="kpi-content">
                    <span className="kpi-label">AI Assisted</span>
                    <h3 className="kpi-value">{aiAssistedCount}</h3>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Recent Tickets Section ─────────────────────────────── */}
            <div className="dashboard-section">
              <div className="section-title-bar animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div>
                  <h2>Recent Support Tickets</h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Latest active tickets submitted by your account</p>
                </div>
                <Link to="/my-tickets" className="btn-link">
                  View All Tickets <ArrowRight size={16} />
                </Link>
              </div>

              <div className="recent-tickets-wrapper animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {recentTickets.length === 0 ? (
                  <div className="dashboard-empty-state">
                    <LifeBuoy size={48} color="var(--primary)" />
                    <h3>No Support Tickets Found</h3>
                    <p>Use SupportPilot AI Assistant for intelligent troubleshooting or submit a direct ticket.</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <Link to="/raise-ticket" className="btn-primary">
                        <Sparkles size={16} /> Launch AI Assistant
                      </Link>
                    </div>
                  </div>
                ) : (
                  recentTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onClick={() => setSelectedTicket(ticket)}
                    />
                  ))
                )}
              </div>
            </div>
          </>
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

export default UserDashboard;
