import React from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Cpu, Layers, Tag, UserCheck, HelpCircle } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

const TicketDetailModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  let causes = [];
  let steps = [];
  let prevention = [];

  try {
    causes = typeof ticket.possible_causes === 'string' ? JSON.parse(ticket.possible_causes) : (ticket.possible_causes || []);
  } catch (e) { causes = []; }

  try {
    steps = typeof ticket.resolution_steps === 'string'
      ? JSON.parse(ticket.resolution_steps)
      : (typeof ticket.suggested_steps === 'string' ? JSON.parse(ticket.suggested_steps) : (ticket.resolution_steps || ticket.suggested_steps || []));
  } catch (e) { steps = []; }

  try {
    prevention = typeof ticket.prevention === 'string' ? JSON.parse(ticket.prevention) : (ticket.prevention || []);
  } catch (e) { prevention = []; }

  const ticketIdDisplay = ticket.ticket_number || `TKT-${String(ticket.id).padStart(6, '0')}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="ticket-id-pill">{ticketIdDisplay}</span>
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            {ticket.issue_title}
          </h2>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <span>🏢 <strong>Department:</strong> {ticket.department}</span>
            <span>🏷️ <strong>Category:</strong> {ticket.category || ticket.matched_category || 'General'}</span>
            <span>📅 <strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}</span>
            <span>🤖 <strong>Source:</strong> {ticket.ticket_source || 'AI Assistant'}</span>
            <span>👤 <strong>Assigned To:</strong> {ticket.assigned_to || 'Unassigned'}</span>
          </div>

          {/* Original Description */}
          <div className="detail-section">
            <h4><HelpCircle size={18} color="var(--primary)" /> Original Description</h4>
            <div className="detail-box">
              {ticket.description}
            </div>
          </div>

          {/* AI Summary */}
          {ticket.summary && (
            <div className="detail-section">
              <h4><Cpu size={18} color="#8B5CF6" /> AI Analysis Summary</h4>
              <div className="detail-box ai-summary-box">
                {ticket.summary}
              </div>
            </div>
          )}

          {/* Severity & Confidence */}
          <div className="detail-grid-2">
            {ticket.severity && (
              <div className="detail-card-small">
                <span className="small-label">Severity Level</span>
                <strong>{ticket.severity}</strong>
              </div>
            )}
            {typeof ticket.confidence === 'number' && (
              <div className="detail-card-small">
                <span className="small-label">AI Confidence Score</span>
                <strong style={{ color: 'var(--resolved)' }}>{ticket.confidence}%</strong>
              </div>
            )}
          </div>

          {/* Possible Causes */}
          {causes.length > 0 && (
            <div className="detail-section">
              <h4><AlertTriangle size={18} color="#F59E0B" /> Identified Causes</h4>
              <ul className="cause-list">
                {causes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Troubleshooting Steps */}
          {steps.length > 0 && (
            <div className="detail-section">
              <h4><CheckCircle2 size={18} color="var(--primary)" /> Troubleshooting Steps Suggested</h4>
              <ol className="step-list">
                {steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Prevention Tips */}
          {prevention.length > 0 && (
            <div className="detail-section">
              <h4><ShieldCheck size={18} color="#10B981" /> Prevention Tips</h4>
              <div className="prevention-grid">
                {prevention.map((p, i) => (
                  <div key={i} className="prevention-card">
                    💡 {p}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
