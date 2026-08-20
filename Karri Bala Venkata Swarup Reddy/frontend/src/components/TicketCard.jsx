import React from 'react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { Building2, Bot, Calendar, User, CheckCircle2 } from 'lucide-react';

const TicketCard = ({ ticket, onResolve, isAdmin, onClick }) => {
  const date = new Date(ticket.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
  
  const displayId = ticket.ticket_number || `TKT-${String(ticket.id).padStart(6, '0')}`;

  const isPending = (ticket.status || '').toLowerCase() === 'open' || (ticket.status || '').toLowerCase() === 'pending';
  const isResolved = (ticket.status || '').toLowerCase() === 'resolved';

  return (
    <div className="ticket-card animate-fade-in" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="ticket-left">
        <span className="ticket-id">{displayId}</span>
      </div>
      <div className="ticket-divider"></div>
      <div className="ticket-right">
        <div className="ticket-top">
          <h3 className="ticket-title">{ticket.issue_title || 'Untitled Ticket'}</h3>
          <div className="ticket-badges">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>
        
        <div className="ticket-middle">
          <div className="ticket-dept">
            <Building2 size={16} />
            {ticket.department || ticket.category || 'General'}
          </div>
          <div className="ticket-dept">
            <User size={16} />
            {ticket.raised_by_name || 'User'}
          </div>
        </div>
        
        <div className="ticket-bottom">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={14} /> Created: {date}
            </span>
            {(ticket.ticket_source === 'AI Assistant' || ticket.resolution_source === 'ai') && (
              <span className="badge badge-ai">
                <Bot size={12} /> AI Assistant
              </span>
            )}
            {isResolved && ticket.resolved_at && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--resolved)' }}>
                <CheckCircle2 size={14} /> 
                Resolved: {new Date(ticket.resolved_at).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {isAdmin && isPending && onResolve && (
            <button
              className="resolve-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                onResolve(ticket.id);
              }}
            >
              <CheckCircle2 size={16} /> Resolve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
