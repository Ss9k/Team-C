const express = require('express');
const router = express.Router();
const db = require('../database/db');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.use(auth);
router.use(adminOnly);

// Safe helper to check user columns
function getUserColumns() {
  try {
    const cols = db.prepare('PRAGMA table_info(users)').all();
    return cols.map((c) => c.name);
  } catch (err) {
    return [];
  }
}

/**
 * GET /api/admin/users/stats
 * Global user stats for overview cards
 */
router.get('/stats', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count || 0;

    const cols = getUserColumns();
    const hasStatus = cols.includes('status');

    const activeUsers = hasStatus
      ? (db.prepare("SELECT COUNT(*) as count FROM users WHERE status IS NULL OR status = 'Active'").get().count || 0)
      : totalUsers;

    const usersWithOpen = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM tickets 
      WHERE status = 'Open' OR status = 'pending'
    `).get().count || 0;

    const usersWithResolved = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM tickets 
      WHERE status = 'Resolved' OR status = 'resolved'
    `).get().count || 0;

    const newThisMonth = db.prepare(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE date(created_at) >= date('now', 'start of month')
    `).get().count || 0;

    res.json({
      totalUsers,
      activeUsers,
      usersWithOpenTickets: usersWithOpen,
      usersWithResolvedTickets: usersWithResolved,
      newUsersThisMonth: newThisMonth
    });
  } catch (error) {
    console.error('Get admin user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/admin/users
 * Returns list of all registered users with aggregated ticket counts
 */
router.get('/', (req, res) => {
  try {
    const { search, department, role, status } = req.query;
    const cols = getUserColumns();
    const hasDept = cols.includes('department');
    const hasPhone = cols.includes('phone');
    const hasStatus = cols.includes('status');
    const hasLastLogin = cols.includes('last_login');

    const deptExpr = hasDept ? "COALESCE(u.department, 'IT Infrastructure')" : "'IT Infrastructure'";
    const phoneExpr = hasPhone ? "COALESCE(u.phone, '+1 (555) 234-5678')" : "'+1 (555) 234-5678'";
    const statusExpr = hasStatus ? "COALESCE(u.status, 'Active')" : "'Active'";
    const lastLoginExpr = hasLastLogin ? "COALESCE(u.last_login, u.created_at)" : "u.created_at";

    let query = `
      SELECT 
        u.id, u.name, u.email, u.role, 
        ${deptExpr} as department,
        ${phoneExpr} as phone,
        ${statusExpr} as status,
        u.created_at,
        ${lastLoginExpr} as last_login,
        COUNT(t.id) as total_tickets,
        SUM(CASE WHEN t.status = 'Open' OR t.status = 'pending' THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN t.status = 'Resolved' OR t.status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets
      FROM users u
      LEFT JOIN tickets t ON u.id = t.user_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
      if (hasDept) {
        query += ` OR u.department LIKE ?`;
        params.push(`%${search}%`);
      }
      query += `)`;
    }

    if (department && department !== 'All' && hasDept) {
      query += ` AND u.department = ?`;
      params.push(department);
    }

    if (role && role !== 'All') {
      query += ` AND u.role = ?`;
      params.push(role);
    }

    if (status && status !== 'All' && hasStatus) {
      query += ` AND u.status = ?`;
      params.push(status);
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const users = db.prepare(query).all(...params);
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/admin/users/:userId
 * Detailed user profile and ticket statistics
 */
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const cols = getUserColumns();
    const hasDept = cols.includes('department');
    const hasPhone = cols.includes('phone');
    const hasStatus = cols.includes('status');
    const hasLastLogin = cols.includes('last_login');

    const deptExpr = hasDept ? "COALESCE(department, 'IT Infrastructure')" : "'IT Infrastructure'";
    const phoneExpr = hasPhone ? "COALESCE(phone, '+1 (555) 234-5678')" : "'+1 (555) 234-5678'";
    const statusExpr = hasStatus ? "COALESCE(status, 'Active')" : "'Active'";
    const lastLoginExpr = hasLastLogin ? "COALESCE(last_login, created_at)" : "created_at";

    const user = db.prepare(`
      SELECT 
        id, name, email, role,
        ${deptExpr} as department,
        ${phoneExpr} as phone,
        ${statusExpr} as status,
        created_at,
        ${lastLoginExpr} as last_login
      FROM users WHERE id = ?
    `).get(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Open' OR status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'Pending' OR status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Resolved' OR status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN ticket_source LIKE '%AI%' OR resolution_source = 'ai' THEN 1 ELSE 0 END) as aiSolved
      FROM tickets WHERE user_id = ?
    `).get(userId);

    res.json({
      user,
      stats: {
        total: stats.total || 0,
        open: stats.open || 0,
        pending: stats.pending || 0,
        resolved: stats.resolved || 0,
        aiSolved: stats.aiSolved || 0
      }
    });
  } catch (error) {
    console.error('Get single user detail error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/admin/users/:userId/tickets
 * All tickets raised by a specific user
 */
router.get('/:userId/tickets', (req, res) => {
  try {
    const { userId } = req.params;
    const tickets = db.prepare(`
      SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC
    `).all(userId);

    res.json(tickets);
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PATCH /api/admin/users/:userId
 * Update user details or disable/enable user
 */
router.patch('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { role, status, department, phone } = req.body;

    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedRole = role || existingUser.role;

    // Ensure columns exist before updating them
    const cols = getUserColumns();
    if (!cols.includes('department')) {
      try { db.exec("ALTER TABLE users ADD COLUMN department TEXT DEFAULT 'IT Infrastructure';"); } catch (e) {}
    }
    if (!cols.includes('phone')) {
      try { db.exec("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT '+1 (555) 234-5678';"); } catch (e) {}
    }
    if (!cols.includes('status')) {
      try { db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'Active';"); } catch (e) {}
    }

    const updatedStatus = status || existingUser.status || 'Active';
    const updatedDept = department || existingUser.department || 'IT Infrastructure';
    const updatedPhone = phone || existingUser.phone || '+1 (555) 234-5678';

    db.prepare(`
      UPDATE users 
      SET role = ?, status = ?, department = ?, phone = ?
      WHERE id = ?
    `).run(updatedRole, updatedStatus, updatedDept, updatedPhone, userId);

    const updated = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId);
    res.json(updated);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
