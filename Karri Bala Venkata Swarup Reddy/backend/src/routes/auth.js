const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../database/db');
const auth    = require('../middleware/auth');

/**
 * Indian Phone Number Validator & Formatter
 * Accepts 10-digit mobile number or +91 format starting with 6, 7, 8, 9.
 * Returns formatted string "+91 XXXXXXXXXX" or "" if empty, or null if invalid.
 */
function formatIndianPhone(phoneStr) {
  if (!phoneStr || !phoneStr.trim()) return '';

  const trimmed = phoneStr.trim();
  const digits = trimmed.replace(/\D/g, '');

  let mobileDigits = digits;
  if (digits.length === 12 && digits.startsWith('91')) {
    mobileDigits = digits.substring(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    mobileDigits = digits.substring(1);
  }

  if (/^[6-9]\d{9}$/.test(mobileDigits)) {
    return `+91 ${mobileDigits}`;
  }

  return null; // Invalid Indian phone number
}

/* ─────────────────────────────────────────────────────────────────────────────
 * POST /api/auth/register
 * ───────────────────────────────────────────────────────────────────────────── */
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || '';
  if (email.toLowerCase() === adminEmail.toLowerCase()) {
    return res.status(400).json({ message: 'This email address is not available for registration.' });
  }

  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hash = bcrypt.hashSync(password, 10);

    const info = db
      .prepare('INSERT INTO users (name, email, password_hash, role, department, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(name.trim(), email.toLowerCase().trim(), hash, 'user', 'IT Infrastructure', '', 'Active');

    res.status(201).json({
      message: 'Account created successfully.',
      userId: info.lastInsertRowid,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
 * POST /api/auth/login
 * ───────────────────────────────────────────────────────────────────────────── */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Update last_login timestamp
    try {
      db.prepare("UPDATE users SET last_login = current_timestamp WHERE id = ?").run(user.id);
    } catch (e) {}

    const payload = {
      id:         user.id,
      name:       user.name,
      email:      user.email,
      role:       user.role,
      department: user.department || 'IT Infrastructure',
      phone:      user.phone || '',
      status:     user.status || 'Active'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({ token, user: payload });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
 * GET /api/auth/me
 * Returns currently authenticated user's complete profile from SQLite
 * ───────────────────────────────────────────────────────────────────────────── */
router.get('/me', auth, (req, res) => {
  try {
    const user = db
      .prepare(`
        SELECT id, name, email, role,
               COALESCE(department, 'IT Infrastructure') as department,
               COALESCE(phone, '') as phone,
               COALESCE(status, 'Active') as status,
               created_at
        FROM users WHERE id = ?
      `)
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Fetch /me error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

/* ─────────────────────────────────────────────────────────────────────────────
 * PUT /api/auth/profile
 * Permanently updates the logged-in user's profile in SQLite database
 * ───────────────────────────────────────────────────────────────────────────── */
router.put('/profile', auth, (req, res) => {
  const { name, department, phone } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Full name cannot be empty.' });
  }

  // Validate Indian Phone Number
  let formattedPhone = '';
  if (phone && phone.trim()) {
    formattedPhone = formatIndianPhone(phone);
    if (formattedPhone === null) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210).'
      });
    }
  }

  try {
    const updatedDept = department ? department.trim() : 'IT Infrastructure';

    db.prepare(`
      UPDATE users 
      SET name = ?, department = ?, phone = ? 
      WHERE id = ?
    `).run(name.trim(), updatedDept, formattedPhone, req.user.id);

    const updatedUser = db.prepare(`
      SELECT id, name, email, role,
             COALESCE(department, 'IT Infrastructure') as department,
             COALESCE(phone, '') as phone,
             COALESCE(status, 'Active') as status,
             created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

module.exports = router;
