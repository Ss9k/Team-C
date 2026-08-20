import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import TicketDetailModal from '../components/TicketDetailModal';
import { useAuth } from '../context/AuthContext';
import { aiAPI, ticketsAPI } from '../services/api';
import {
  Bot, CheckCircle2, AlertTriangle, Zap, ShieldCheck,
  Clock, Sparkles, AlertCircle, RefreshCw, Eye, LayoutDashboard,
  FileText, CheckSquare, UploadCloud, Send, X, ArrowLeft
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

const ROTATING_LOADING_MESSAGES = [
  'Analyzing your issue...',
  'Checking possible causes...',
  'Generating troubleshooting steps...',
  'Preparing recommendations...'
];

const RaiseTicket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Workflow states: 'input_form' | 'loading' | 'ai_analysis' | 'confirm_submit' | 'resolved_success' | 'ticket_created_success'
  const [workflowState, setWorkflowState] = useState('input_form');
  const [error, setError] = useState('');

  // Form inputs
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('IT Infrastructure');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);

  // Rotating loading message index
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // AI Response Data
  const [aiResult, setAiResult] = useState(null);

  // Resolution step checkboxes state: { [stepIndex]: boolean }
  const [checkedSteps, setCheckedSteps] = useState({});

  // Created Ticket Data
  const [createdTicket, setCreatedTicket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  /* ── Rotate loading messages while in 'loading' ─────────────── */
  useEffect(() => {
    let interval;
    if (workflowState === 'loading') {
      setLoadingMsgIdx(0);
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % ROTATING_LOADING_MESSAGES.length);
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [workflowState]);

  /* ── Attachment file handler ────────────────────────────────── */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  /* ── STEP 2 & 3: Call Gemini API when '🤖 Analyze with AI' is clicked ─ */
  const handleAnalyzeWithAI = async (e) => {
    e.preventDefault();
    if (description.trim().length < 15) {
      setError('Please provide at least 15 characters in the description.');
      return;
    }

    setError('');
    setWorkflowState('loading');

    try {
      const data = await aiAPI.analyze({
        title,
        department,
        description,
      });

      if (data.error) {
        console.error('Gemini error:', data.message);
        setError('Gemini API failed. AI analysis is temporarily unavailable.');
        setWorkflowState('input_form');
        return;
      }

      setAiResult(data);
      setCheckedSteps({});
      setWorkflowState('ai_analysis');
    } catch (err) {
      console.error('AI Analysis request failed:', err);
      setError(err.response?.data?.message || 'Gemini API failed. AI analysis is temporarily unavailable.');
      setWorkflowState('input_form');
    }
  };

  /* ── Toggle step checkbox ──────────────────────────────────── */
  const toggleStepCheck = (index) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  /* ── STEP 6: User Clicks YES (Resolved) ────────────────────── */
  const handleUserClickYes = () => {
    setWorkflowState('resolved_success');
  };

  /* ── STEP 6: User Clicks NO (Still Need Help -> Reveals Submit Ticket) ─ */
  const handleUserClickNo = () => {
    setWorkflowState('confirm_submit');
  };

  /* ── STEP 7: Submit Ticket to existing backend API ─────────── */
  const handleSubmitTicket = async () => {
    setWorkflowState('loading');
    setError('');

    try {
      const finalDescription = attachment
        ? `${description}\n\n[Attached File: ${attachment.name}]`
        : description;

      const payload = {
        raised_by_name: user?.name || 'User',
        issue_title: title,
        department,
        description: finalDescription,
        summary: aiResult?.summary || '',
        category: aiResult?.category || department,
        priority: aiResult?.priority || 'Medium',
        severity: aiResult?.severity || 'Medium',
        confidence: aiResult?.confidence || 85,
        possible_causes: aiResult?.possible_causes || [],
        resolution_steps: aiResult?.resolution_steps || [],
        prevention: aiResult?.prevention || [],
        estimated_resolution_time: aiResult?.estimated_resolution_time || '15-30 minutes',
        needs_escalation: aiResult?.needs_escalation || false,
        escalation_reason: aiResult?.escalation_reason || '',
        ticket_source: 'AI Assisted Ticket'
      };

      const ticket = await ticketsAPI.create(payload);
      setCreatedTicket(ticket);
      setWorkflowState('ticket_created_success');
    } catch (err) {
      console.error('Ticket creation error:', err);
      setError('Failed to create support ticket. Please try again.');
      setWorkflowState('confirm_submit');
    }
  };

  /* ── Reset Form ────────────────────────────────────────────── */
  const handleReset = () => {
    setTitle('');
    setDescription('');
    setDepartment('IT Infrastructure');
    setAttachment(null);
    setAiResult(null);
    setCheckedSteps({});
    setCreatedTicket(null);
    setError('');
    setWorkflowState('input_form');
  };

  return (
    <UserLayout activeTab="raise-ticket">
      <div className="admin-dashboard-container animate-fade-in" style={{ padding: '1.75rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>

          {/* Compact Page Title (No hero banner) */}
          <div className="admin-header-title-bar" style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid #EEF2FF' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={22} color="var(--primary)" /> AI-Assisted Ticket Creation
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.2rem 0 0' }}>
              Analyze your issue with Gemini 2.5 Flash before a support ticket is created.
            </p>
          </div>

          {error && <div className="auth-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          {/* ═════════════════════════════════════════════════════════
              STEP 1 & 2: INPUT FORM WITH "🤖 Analyze with AI" BUTTON ONLY
              (NO SUBMIT TICKET BUTTON ALLOWED HERE)
             ═════════════════════════════════════════════════════════ */}
          {workflowState === 'input_form' && (
            <div className="pilot-card animate-slide-up">
              <h2><Bot size={24} color="var(--primary)" /> Describe Your IT Problem</h2>
              <p className="card-subtitle">Provide details. You must first analyze the problem with AI before submitting a ticket.</p>

              <form onSubmit={handleAnalyzeWithAI}>
                <div className="form-group">
                  <label htmlFor="issue-title">Issue Title</label>
                  <input
                    id="issue-title"
                    type="text"
                    placeholder="e.g., Cannot connect to VPN or printer spooler error"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="issue-dept">Department</label>
                  <select
                    id="issue-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="issue-desc">Description</label>
                  <textarea
                    id="issue-desc"
                    rows="5"
                    placeholder="Describe error messages, symptoms, and when the issue started..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <small style={{ color: description.length >= 15 ? '#10B981' : 'var(--text-muted)' }}>
                    {description.length} / 15 minimum characters
                  </small>
                </div>

                {/* Optional Attachment Upload */}
                <div className="form-group">
                  <label>Attachment (Optional)</label>
                  <div className="file-upload-dropzone" style={{ padding: '1.25rem' }}>
                    <input
                      type="file"
                      id="ai-attachment-input"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    {!attachment ? (
                      <label htmlFor="ai-attachment-input" className="file-upload-label">
                        <UploadCloud size={28} color="var(--primary)" />
                        <span style={{ fontSize: '0.9rem' }}>Attach log file or screenshot</span>
                      </label>
                    ) : (
                      <div className="file-preview-box">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={18} color="var(--primary)" />
                          <strong>{attachment.name}</strong>
                        </div>
                        <button type="button" className="file-remove-btn" onClick={() => setAttachment(null)}>
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* STEP 2: ONLY "🤖 Analyze with AI" BUTTON DISPLAYED */}
                <button type="submit" className="btn-primary btn-large" style={{ width: '100%', marginTop: '1.25rem' }}>
                  🤖 Analyze with AI
                </button>
              </form>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 3 & 4: LOADING SCREEN WITH ROTATING MESSAGES
             ═════════════════════════════════════════════════════════ */}
          {workflowState === 'loading' && (
            <div className="pilot-card loading-card animate-fade-in">
              <div className="ai-pulse-icon">
                <Bot size={48} className="pulse-bot" />
              </div>
              <h3 className="typing-text">{ROTATING_LOADING_MESSAGES[loadingMsgIdx]}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Evaluating symptoms, determining root causes, and generating step-by-step resolution steps.
              </p>
              <div className="ai-loader-bar">
                <div className="ai-loader-progress"></div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 4 & 5: AI ANALYSIS & INTERACTIVE CHECKLIST
             ═════════════════════════════════════════════════════════ */}
          {workflowState === 'ai_analysis' && aiResult && (
            <div className="analysis-results-wrapper animate-slide-up">
              
              {/* Cards Grid */}
              <div className="results-top-grid">
                {/* Issue Summary */}
                <div className="res-card summary-card">
                  <div className="res-card-header">
                    <Sparkles size={20} color="var(--primary)" />
                    <h3>Issue Summary</h3>
                  </div>
                  <p>{aiResult.summary}</p>
                </div>

                {/* Category */}
                <div className="res-card">
                  <div className="res-card-header">
                    <FileText size={18} color="#3B82F6" />
                    <span className="card-mini-label">Category</span>
                  </div>
                  <strong className="badge-tag tag-blue">{aiResult.category}</strong>
                </div>

                {/* Priority */}
                <div className="res-card">
                  <div className="res-card-header">
                    <AlertCircle size={18} color="#F59E0B" />
                    <span className="card-mini-label">Priority Level</span>
                  </div>
                  <strong className={`badge-tag priority-${(aiResult.priority || 'medium').toLowerCase()}`}>
                    {aiResult.priority}
                  </strong>
                </div>

                {/* Confidence Score */}
                <div className="res-card confidence-card">
                  <div className="res-card-header">
                    <ShieldCheck size={18} color="#10B981" />
                    <span className="card-mini-label">Confidence Score</span>
                    <span className="confidence-num">{aiResult.confidence}%</span>
                  </div>
                  <div className="confidence-track">
                    <div
                      className="confidence-fill-bar"
                      style={{
                        width: `${aiResult.confidence}%`,
                        backgroundColor: aiResult.confidence > 70 ? '#10B981' : '#F59E0B'
                      }}
                    />
                  </div>
                </div>

                {/* Estimated Resolution Time */}
                {aiResult.estimated_resolution_time && (
                  <div className="res-card">
                    <div className="res-card-header">
                      <Clock size={18} color="#8B5CF6" />
                      <span className="card-mini-label">Est. Resolution Time</span>
                    </div>
                    <strong className="badge-tag tag-indigo">⏱️ {aiResult.estimated_resolution_time}</strong>
                  </div>
                )}
              </div>

              {/* Possible Causes */}
              {aiResult.possible_causes && aiResult.possible_causes.length > 0 && (
                <div className="res-card section-card">
                  <h3 className="section-card-title">
                    <AlertTriangle size={20} color="#F59E0B" /> Possible Causes
                  </h3>
                  <ul className="root-causes-list">
                    {aiResult.possible_causes.map((cause, idx) => (
                      <li key={idx}>
                        <span className="cause-bullet">•</span> {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* STEP 5: INTERACTIVE CHECKLIST */}
              {aiResult.resolution_steps && aiResult.resolution_steps.length > 0 && (
                <div className="res-card section-card">
                  <h3 className="section-card-title">
                    <CheckSquare size={20} color="var(--primary)" /> Troubleshooting Checklist
                  </h3>
                  <p className="checklist-sub">Mark each step as you complete it:</p>

                  <div className="troubleshooting-checklist">
                    {aiResult.resolution_steps.map((step, idx) => {
                      const isChecked = Boolean(checkedSteps[idx]);
                      return (
                        <div
                          key={idx}
                          className={`checklist-item ${isChecked ? 'completed-step' : ''}`}
                          onClick={() => toggleStepCheck(idx)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                          />
                          <div className="step-badge-num">Step {idx + 1}</div>
                          <div className="step-text-content">{step}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Prevention Tips */}
              {aiResult.prevention && aiResult.prevention.length > 0 && (
                <div className="res-card section-card green-prevention-card">
                  <h3 className="section-card-title" style={{ color: '#065F46' }}>
                    <ShieldCheck size={20} color="#10B981" /> Prevention Tips
                  </h3>
                  <div className="prevention-cards-grid">
                    {aiResult.prevention.map((tip, idx) => (
                      <div key={idx} className="prevention-green-box">
                        💡 {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═════════════════════════════════════════════════════
                  STEP 6: RESOLUTION DECISION BOX
                 ═════════════════════════════════════════════════════ */}
              <div className="resolution-decision-card">
                <h3>Did these troubleshooting steps resolve your issue?</h3>

                <div className="decision-buttons" style={{ marginTop: '1.25rem' }}>
                  <button className="btn-success-large" onClick={handleUserClickYes}>
                    <CheckCircle2 size={22} /> ✅ Yes, My Issue Is Resolved
                  </button>

                  <button className="btn-danger-large" onClick={handleUserClickNo}>
                    <AlertCircle size={22} /> ❌ No, I Still Need Help
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              IF USER CLICKS YES: SUCCESS PAGE (DO NOT CREATE TICKET)
             ═════════════════════════════════════════════════════════ */}
          {workflowState === 'resolved_success' && (
            <div className="pilot-card success-card animate-slide-up">
              <div className="success-icon-wrap">
                <CheckCircle2 className="large-success-svg" />
              </div>
              <h2 style={{ color: '#10B981', fontSize: '2.2rem', marginBottom: '0.5rem' }}>Great!</h2>
              <h3>Your issue has been resolved using SupportPilot AI.</h3>
              <p className="success-body-text" style={{ marginTop: '0.5rem' }}>
                No support ticket has been created.<br />
                Thank you for using our AI Assistant.
              </p>

              <div className="success-actions">
                <button className="btn-primary btn-large" onClick={handleReset}>
                  <RefreshCw size={18} /> Analyze Another Issue
                </button>
                <button className="btn-outline btn-large" onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard size={18} /> Go to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              IF USER CLICKS NO: SUBMIT TICKET BUTTON IS NOW REVEALED
             ═════════════════════════════════════════════════════════ */}
          {workflowState === 'confirm_submit' && (
            <div className="pilot-card animate-slide-up" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <AlertCircle size={48} color="#F59E0B" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Your issue still requires assistance.</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
                Please submit a support ticket to escalate your case to our IT helpdesk engineering team.
              </p>

              <div className="decision-buttons" style={{ justifyContent: 'center' }}>
                <button className="btn-primary btn-large" onClick={handleSubmitTicket}>
                  <Send size={20} /> Submit Ticket
                </button>

                <button className="btn-outline btn-large" onClick={() => setWorkflowState('ai_analysis')}>
                  <ArrowLeft size={18} /> Back to AI Analysis
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              SUCCESS PAGE AFTER TICKET CREATION
             ═════════════════════════════════════════════════════════ */}
          {workflowState === 'ticket_created_success' && createdTicket && (
            <div className="pilot-card ticket-created-card animate-slide-up">
              <div className="ticket-created-header">
                <CheckCircle2 size={40} color="#10B981" />
                <div>
                  <h2>Ticket Created Successfully</h2>
                  <p>Your support case has been submitted and assigned to our IT helpdesk queue.</p>
                </div>
              </div>

              <div className="created-ticket-info-box">
                <div className="info-row">
                  <span>Ticket Number</span>
                  <strong className="tkt-highlight">
                    {createdTicket.ticket_number || `TKT-${String(createdTicket.id).padStart(6, '0')}`}
                  </strong>
                </div>

                <div className="info-row">
                  <span>Status</span>
                  <span className="status-open-badge">● {createdTicket.status || 'Open'}</span>
                </div>

                <div className="info-row">
                  <span>Priority</span>
                  <span className={`badge-tag priority-${(createdTicket.priority || 'medium').toLowerCase()}`}>
                    {createdTicket.priority}
                  </span>
                </div>

                <div className="info-row">
                  <span>Category</span>
                  <strong>{createdTicket.category || createdTicket.department}</strong>
                </div>

                <div className="info-row">
                  <span>Created Time</span>
                  <span>{new Date(createdTicket.created_at || Date.now()).toLocaleString()}</span>
                </div>
              </div>

              <div className="ticket-created-actions">
                <button className="btn-primary" onClick={() => setShowDetailModal(true)}>
                  <Eye size={18} /> View Ticket
                </button>

                <button className="btn-outline" onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard size={18} /> Go to Dashboard
                </button>

                <button className="btn-outline" onClick={handleReset}>
                  <RefreshCw size={18} /> Raise Another Ticket
                </button>
              </div>
            </div>
          )}

        {/* Ticket Detail Modal */}
        {showDetailModal && createdTicket && (
          <TicketDetailModal
            ticket={createdTicket}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </div>
    </UserLayout>
  );
};

export default RaiseTicket;
