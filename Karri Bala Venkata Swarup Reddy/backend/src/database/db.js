const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'sams.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Create initial tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT current_timestamp
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number TEXT,
    user_id INTEGER,
    raised_by_name TEXT NOT NULL,
    issue_title TEXT NOT NULL,
    department TEXT NOT NULL,
    description TEXT NOT NULL,
    summary TEXT,
    category TEXT,
    matched_category TEXT,
    matched_topic TEXT,
    priority TEXT DEFAULT 'Medium',
    severity TEXT DEFAULT 'Medium',
    confidence INTEGER DEFAULT 0,
    possible_causes TEXT,
    suggested_steps TEXT,
    resolution_steps TEXT,
    prevention TEXT,
    estimated_resolution_time TEXT,
    needs_escalation INTEGER DEFAULT 0,
    escalation_reason TEXT,
    status TEXT DEFAULT 'Open',
    assigned_to TEXT DEFAULT 'Unassigned',
    ticket_source TEXT DEFAULT 'AI Assistant',
    resolution_source TEXT,
    created_at TEXT DEFAULT current_timestamp,
    resolved_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS TicketTimeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER,
    event TEXT NOT NULL,
    created_at TEXT DEFAULT current_timestamp,
    FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
  );
`);

// Safe column migrations for existing SQLite databases
const columnsToAdd = [
  { name: 'ticket_number', type: 'TEXT' },
  { name: 'summary', type: 'TEXT' },
  { name: 'category', type: 'TEXT' },
  { name: 'severity', type: "TEXT DEFAULT 'Medium'" },
  { name: 'confidence', type: 'INTEGER DEFAULT 0' },
  { name: 'possible_causes', type: 'TEXT' },
  { name: 'resolution_steps', type: 'TEXT' },
  { name: 'prevention', type: 'TEXT' },
  { name: 'estimated_resolution_time', type: 'TEXT' },
  { name: 'needs_escalation', type: 'INTEGER DEFAULT 0' },
  { name: 'escalation_reason', type: 'TEXT' },
  { name: 'assigned_to', type: "TEXT DEFAULT 'Unassigned'" },
  { name: 'ticket_source', type: "TEXT DEFAULT 'AI Assistant'" },
];

for (const col of columnsToAdd) {
  try {
    db.exec(`ALTER TABLE tickets ADD COLUMN ${col.name} ${col.type};`);
  } catch (err) {
    // Column already exists, ignore
  }
}

const userColumnsToAdd = [
  { name: 'department', type: "TEXT DEFAULT 'IT Infrastructure'" },
  { name: 'phone', type: "TEXT DEFAULT ''" },
  { name: 'status', type: "TEXT DEFAULT 'Active'" },
  { name: 'last_login', type: 'TEXT DEFAULT current_timestamp' }
];

for (const col of userColumnsToAdd) {
  try {
    db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type};`);
  } catch (err) {
    // Column already exists, ignore
  }
}

// Clean up fake default US phone numbers in SQLite database
try {
  db.exec("UPDATE users SET phone = '' WHERE phone = '+1 (555) 234-5678' OR phone LIKE '+1 (555)%';");
} catch (err) {
  // Ignore
}

module.exports = db;
