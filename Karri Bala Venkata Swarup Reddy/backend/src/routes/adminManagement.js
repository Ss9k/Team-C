const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const auth = require('../middleware/auth');
const superadminOnly = require('../middleware/superadminOnly');

router.use(auth);

// Helper to inspect table columns safely
function getUserColumns() {
  try {
    const cols = db.prepare('PRAGMA table_info(users)').all();
    return cols.map((c) => c.name);
  } catch (err) {
    return [];
  }
}

/**
 * GET /api/admin/admins
 * Returns list of all administrators
 */
router.get('/', (req, res) => {
  try {
    const cols = getUserColumns();
    const hasDept = cols.includes('department');
    const hasPhone = cols.includes('phone');
    const hasStatus = cols.includes('status');
    const hasLastLogin = cols.includes('last_login');

    const deptExpr = hasDept ? "COALESCE(department, 'IT Administration')" : "'IT Administration'";
    const phoneExpr = hasPhone ? "COALESCE(phone, '+1 (555) 019-2831')" : "'+1 (555) 019-2831'";
    const statusExpr = hasStatus ? "COALESCE(status, 'Active')" : "'Active'";
    const lastLoginExpr = hasLastLogin ? "COALESCE(last_login, created_at)" : "created_at";

    const admins = db.prepare(`
      SELECT 
        id, name, email, role,
        ${deptExpr} as department,
        ${phoneExpr} as phone,
        ${statusExpr} as status,
        created_at,
        ${lastLoginExpr} as last_login
      FROM users 
      WHERE role = 'admin' OR role = 'superadmin' OR email = 'swarupchiru@gmail.com' OR email = 'admin@sams.com'
      ORDER BY created_at ASC
    `).all();

    res.json(admins);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/admin/admins (Super Admin Only)
 * Creates a new Administrator account
 */
router.post('/', superadminOnly, (req, res) => {
  const { name, email, phone, department, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hash = bcrypt.hashSync(password, 10);
    // SINGLE SUPER ADMIN RULE: Every created administrator MUST automatically be 'admin'
    const assignedRole = 'admin';
    const assignedDept = department || 'IT Administration';
    const assignedPhone = phone || '+1 (555) 019-2831';

    // Ensure columns exist before inserting
    const cols = getUserColumns();
    if (!cols.includes('department')) { try { db.exec("ALTER TABLE users ADD COLUMN department TEXT DEFAULT 'IT Administration';"); } catch (e) {} }
    if (!cols.includes('phone')) { try { db.exec("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT '+1 (555) 019-2831';"); } catch (e) {} }
    if (!cols.includes('status')) { try { db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'Active';"); } catch (e) {} }

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, department, phone, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Active')
    `).run(name, email, hash, assignedRole, assignedDept, assignedPhone);

    const newAdmin = db.prepare(`
      SELECT id, name, email, role, department, phone, status, created_at
      FROM users WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Failed to create administrator account.' });
  }
});

/**
 * PUT /api/admin/admins/:id (Super Admin Only)
 * Update admin details or status
 */
router.put('/:id', superadminOnly, (req, res) => {
  const { id } = req.params;
  const { name, department, phone, status } = req.body;

  try {
    const targetAdmin = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!targetAdmin) {
      return res.status(404).json({ message: 'Administrator account not found.' });
    }

    const isTargetSuper = targetAdmin.email === 'swarupchiru@gmail.com' || targetAdmin.role === 'superadmin';
    if (isTargetSuper && status === 'Disabled') {
      return res.status(403).json({ message: 'The Super Admin account cannot be disabled or demoted.' });
    }

    const newName = name || targetAdmin.name;
    const newDept = department || targetAdmin.department || 'IT Administration';
    const newPhone = phone || targetAdmin.phone || '+1 (555) 019-2831';
    // Single Super Admin rule: Role remains superadmin for the original Super Admin and admin for all others
    const newRole = isTargetSuper ? 'superadmin' : 'admin';
    const newStatus = isTargetSuper ? 'Active' : (status || targetAdmin.status || 'Active');

    db.prepare(`
      UPDATE users
      SET name = ?, department = ?, phone = ?, role = ?, status = ?
      WHERE id = ?
    `).run(newName, newDept, newPhone, newRole, newStatus, id);

    const updated = db.prepare('SELECT id, name, email, role, department, phone, status, created_at FROM users WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ message: 'Failed to update administrator.' });
  }
});

/**
 * POST /api/admin/admins/:id/reset-password (Super Admin Only)
 */
router.post('/:id/reset-password', superadminOnly, (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }

  try {
    const targetAdmin = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!targetAdmin) {
      return res.status(404).json({ message: 'Administrator account not found.' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, id);

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
});

/**
 * DELETE /api/admin/admins/:id (Super Admin Only)
 * Permanently removes an administrator account
 */
router.delete('/:id', superadminOnly, (req, res) => {
  const { id } = req.params;

  try {
    const targetAdmin = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!targetAdmin) {
      return res.status(404).json({ message: 'Administrator account not found.' });
    }

    if (targetAdmin.id === req.user.id) {
      return res.status(403).json({ message: 'You cannot delete your own account.' });
    }

    if (targetAdmin.email === 'swarupchiru@gmail.com' || targetAdmin.role === 'superadmin') {
      return res.status(403).json({ message: 'The Super Admin account cannot be deleted.' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ message: 'Administrator account deleted successfully.' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Failed to delete administrator account.' });
  }
});

module.exports = router;
