import Database from 'better-sqlite3';
import path from 'path';

// Define the database path
const dbPath = path.resolve(process.cwd(), 'wedding.sqlite');

// Initialize the database
export const db = new Database(dbPath);

// Create tables
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS weddings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      venue TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      wedding_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (wedding_id) REFERENCES weddings (id)
    );

    CREATE TABLE IF NOT EXISTS invitations (
      id TEXT PRIMARY KEY,
      wedding_id TEXT NOT NULL,
      guest_id TEXT NOT NULL,
      invite_number TEXT NOT NULL,
      invitation_code TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (wedding_id) REFERENCES weddings (id),
      FOREIGN KEY (guest_id) REFERENCES guests (id)
    );

    CREATE TABLE IF NOT EXISTS check_ins (
      id TEXT PRIMARY KEY,
      invitation_id TEXT UNIQUE NOT NULL,
      checked_in_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      checked_in_by TEXT NOT NULL,
      FOREIGN KEY (invitation_id) REFERENCES invitations (id)
    );
  `);
}
