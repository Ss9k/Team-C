const db = require('./db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

/**
 * seedAdmin()
 * ─────────────────────────────────────────────────────────────────────────────
 * Ensures exactly one admin account exists in the database.
 *
 * Strategy:
 *  1. Read the canonical admin email from ADMIN_EMAIL env var.
 *  2. If a user row with that email already exists, skip (idempotent).
 *  3. If no user with that email exists, hash the password and insert
 *     a new row with role = 'admin'.
 *
 * This function NEVER stores plaintext passwords. The password is read from
 * the environment only at startup, hashed immediately, and then discarded.
 */
function seedAdmin() {
  const adminEmail    = process.env.ADMIN_EMAIL;
  const adminName     = process.env.ADMIN_NAME   || 'Super Admin';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('[SEED] ADMIN_EMAIL or ADMIN_PASSWORD missing — skipping admin seed.');
    return;
  }

  try {
    // Check whether this specific admin account already exists
    const existing = db.prepare('SELECT id, role FROM users WHERE email = ?').get(adminEmail);

    if (existing) {
      // If the row exists but is not admin (e.g. someone registered with that
      // email before the env was configured), promote it to admin.
      if (existing.role !== 'admin') {
        db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(existing.id);
        console.log(`[SEED] Promoted existing account (${adminEmail}) to admin.`);
      } else {
        console.log(`[SEED] Admin account already exists (${adminEmail}).`);
      }
      return;
    }

    // Create the admin account with a bcrypt-hashed password
    const hash = bcrypt.hashSync(adminPassword, 10);
    db.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).run(adminName, adminEmail, hash, 'admin');

    console.log(`[SEED] Admin account created: ${adminEmail}`);
  } catch (err) {
    console.error('[SEED] Failed to seed admin account:', err.message);
  }
}

module.exports = { seedAdmin };
