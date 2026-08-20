const express = require('express');
const router = express.Router();
const db = require('../database/db');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.use(auth);

/**
 * POST /api/tickets
 */
router.post('/', (req, res) => {
  const {
    issue_title,
    department,
    description,
    summary,
    category,
    priority,
    severity,
    confidence,
    possible_causes,
    resolution_steps,
    prevention,
    estimated_resolution_time,
    needs_escalation,
    escalation_reason,
    raised_by_name
  } = req.body;

  try {
    const userName = raised_by_name || req.user.name || 'User';

    const insertTicket = db.prepare(`
      INSERT INTO tickets (
        user_id, raised_by_name, issue_title, department, description,
        summary, category, matched_category, priority, severity, confidence,
        possible_causes, resolution_steps, suggested_steps, prevention,
        estimated_resolution_time, needs_escalation, escalation_reason,
        status, assigned_to, ticket_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertTicket.run(
      req.user.id,
      userName,
      issue_title || 'IT Support Ticket',
      department || 'General',
      description,
      summary || null,
      category || department || 'General',
      category || department || 'General',
      priority || 'Medium',
      severity || priority || 'Medium',
      typeof confidence === 'number' ? confidence : 80,
      possible_causes ? (typeof possible_causes === 'string' ? possible_causes : JSON.stringify(possible_causes)) : null,
      resolution_steps ? (typeof resolution_steps === 'string' ? resolution_steps : JSON.stringify(resolution_steps)) : null,
      resolution_steps ? (typeof resolution_steps === 'string' ? resolution_steps : JSON.stringify(resolution_steps)) : null,
      prevention ? (typeof prevention === 'string' ? prevention : JSON.stringify(prevention)) : null,
      estimated_resolution_time || '15-30 minutes',
      needs_escalation ? 1 : 0,
      escalation_reason || null,
      'Open',
      'Unassigned',
      'Gemini AI Assistant'
    );

    const numericId = result.lastInsertRowid;
    const ticketNumber = `TKT-${String(numericId).padStart(6, '0')}`;

    db.prepare('UPDATE tickets SET ticket_number = ? WHERE id = ?').run(ticketNumber, numericId);

    db.prepare('INSERT INTO TicketTimeline (ticket_id, event) VALUES (?, ?)')
      .run(numericId, `${userName} created ticket ${ticketNumber}`);

    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(numericId);
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Failed to create support ticket' });
  }
});

/**
 * GET /api/tickets/mine
 */
router.get('/mine', (req, res) => {
  try {
    const tickets = db.prepare('SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(tickets);
  } catch (error) {
    console.error('Get my tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/tickets/mine/stats
 */
router.get('/mine/stats', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Open' OR status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Resolved' OR status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN ticket_source LIKE '%AI%' OR resolution_source = 'ai' THEN 1 ELSE 0 END) as aiSolved
      FROM tickets WHERE user_id = ?
    `).get(req.user.id);
    
    res.json({
      total: stats.total || 0,
      pending: stats.pending || 0,
      resolved: stats.resolved || 0,
      aiSolved: stats.aiSolved || 0
    });
  } catch (error) {
    console.error('Get my stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/tickets/recent-activity (Admin / Global activity feed)
 */
router.get('/recent-activity', (req, res) => {
  try {
    const activities = db.prepare(`
      SELECT tl.id, tl.event, tl.created_at, t.ticket_number, t.raised_by_name
      FROM TicketTimeline tl
      LEFT JOIN tickets t ON tl.ticket_id = t.id
      ORDER BY tl.created_at DESC
      LIMIT 12
    `).all();

    res.json(activities);
  } catch (error) {
    console.error('Get activity feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/tickets/stats (Admin — GLOBAL STATISTICS Across ALL Users)
 * MUST BE PLACED BEFORE /:id
 */
router.get('/stats', adminOnly, (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Open' OR status = 'open' THEN 1 ELSE 0 END) as openCount,
        SUM(CASE WHEN status = 'In Progress' OR status = 'in_progress' THEN 1 ELSE 0 END) as inProgressCount,
        SUM(CASE WHEN status = 'Resolved' OR status = 'resolved' THEN 1 ELSE 0 END) as resolvedCount,
        SUM(CASE WHEN status = 'Pending' OR status = 'pending' THEN 1 ELSE 0 END) as pendingCount,
        SUM(CASE WHEN priority = 'Critical' OR priority = 'critical' THEN 1 ELSE 0 END) as criticalCount,
        SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) as todayCount,
        SUM(CASE WHEN ticket_source LIKE '%AI%' OR resolution_source = 'ai' THEN 1 ELSE 0 END) as aiSolvedCount
      FROM tickets
    `).get();

    const avgTimeRow = db.prepare(`
      SELECT AVG(
        (julianday(resolved_at) - julianday(created_at)) * 24
      ) as avg_hours
      FROM tickets 
      WHERE (status = 'Resolved' OR status = 'resolved') AND resolved_at IS NOT NULL
    `).get();

    const deptData = db.prepare(`
      SELECT department, COUNT(*) as count 
      FROM tickets 
      GROUP BY department
    `).all();

    res.json({
      total: stats.total || 0,
      open: stats.openCount || 0,
      inProgress: stats.inProgressCount || 0,
      resolved: stats.resolvedCount || 0,
      pending: stats.pendingCount || 0,
      critical: stats.criticalCount || 0,
      todayCount: stats.todayCount || 0,
      aiSolvedCount: stats.aiSolvedCount || 0,
      avgResolutionTime: avgTimeRow.avg_hours ? Number(avgTimeRow.avg_hours.toFixed(2)) : 1.2,
      departmentBreakdown: deptData || []
    });
  } catch (error) {
    console.error('Get global stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/tickets/:id
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    let ticket;

    if (id.startsWith('TKT-')) {
      ticket = db.prepare('SELECT * FROM tickets WHERE ticket_number = ?').get(id);
    } else {
      ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
    }

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (req.user.role !== 'admin' && ticket.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket detail error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/tickets (Admin — Returns all tickets across all users)
 */
router.get('/', adminOnly, (req, res) => {
  try {
    const { status, priority, department, search } = req.query;
    let query = `
      SELECT t.*, u.email as user_email
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND (t.status = ? OR (t.status = 'Open' AND ? = 'pending'))`;
      params.push(status, status);
    }
    if (priority) {
      query += ` AND (t.priority = ? OR (t.priority = 'Critical' AND ? = 'critical'))`;
      params.push(priority, priority);
    }
    if (department) {
      query += ` AND t.department = ?`;
      params.push(department);
    }
    if (search) {
      query += ` AND (t.ticket_number LIKE ? OR t.raised_by_name LIKE ? OR t.issue_title LIKE ? OR t.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += `
      ORDER BY 
        CASE 
          WHEN t.status = 'Open' OR t.status = 'pending' THEN 1
          WHEN t.status = 'In Progress' OR t.status = 'in_progress' THEN 2 
          ELSE 3 
        END,
        CASE t.priority 
          WHEN 'Critical' THEN 1 
          WHEN 'critical' THEN 1 
          WHEN 'High' THEN 2 
          WHEN 'high' THEN 2 
          WHEN 'Medium' THEN 3 
          WHEN 'medium' THEN 3 
          WHEN 'Low' THEN 4 
          WHEN 'low' THEN 4 
          ELSE 5 
        END,
        t.created_at DESC
    `;

    const tickets = db.prepare(query).all(...params);
    res.json(tickets);
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PATCH /api/tickets/:id/resolve (Admin)
 */
router.patch('/:id/resolve', adminOnly, (req, res) => {
  try {
    const { id } = req.params;
    
    const info = db.prepare(`
      UPDATE tickets 
      SET status = 'Resolved', resolved_at = current_timestamp 
      WHERE (id = ? OR ticket_number = ?) AND status != 'Resolved' AND status != 'resolved'
    `).run(id, id);

    if (info.changes === 0) {
      return res.status(404).json({ message: 'Ticket not found or already resolved' });
    }

    db.prepare('INSERT INTO TicketTimeline (ticket_id, event) VALUES ((SELECT id FROM tickets WHERE id = ? OR ticket_number = ?), ?)')
      .run(id, id, `Engineer resolved ticket`);

    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ? OR ticket_number = ?').get(id, id);
    res.json(updatedTicket);
  } catch (error) {
    console.error('Resolve ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PATCH /api/tickets/:id/assign (Admin)
 */
router.patch('/:id/assign', adminOnly, (req, res) => {
  try {
    const { id } = req.params;
    const { engineerName } = req.body;
    const assignedName = engineerName || 'Engineer David';

    db.prepare(`
      UPDATE tickets 
      SET assigned_to = ?, status = 'In Progress'
      WHERE id = ? OR ticket_number = ?
    `).run(assignedName, id, id);

    db.prepare('INSERT INTO TicketTimeline (ticket_id, event) VALUES ((SELECT id FROM tickets WHERE id = ? OR ticket_number = ?), ?)')
      .run(id, id, `Assigned to ${assignedName}`);

    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ? OR ticket_number = ?').get(id, id);
    res.json(updatedTicket);
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PATCH /api/tickets/:id/close (Admin)
 */
router.patch('/:id/close', adminOnly, (req, res) => {
  try {
    const { id } = req.params;

    db.prepare(`
      UPDATE tickets 
      SET status = 'Resolved', resolved_at = current_timestamp
      WHERE id = ? OR ticket_number = ?
    `).run(id, id);

    db.prepare('INSERT INTO TicketTimeline (ticket_id, event) VALUES ((SELECT id FROM tickets WHERE id = ? OR ticket_number = ?), ?)')
      .run(id, id, `Ticket closed by admin`);

    const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ? OR ticket_number = ?').get(id, id);
    res.json(updatedTicket);
  } catch (error) {
    console.error('Close ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
