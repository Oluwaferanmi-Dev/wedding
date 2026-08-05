import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { db, initDB } from './db.js';
import crypto from 'crypto';

// Initialize the database on startup
initDB();

const JWT_SECRET = 'super_secret_wedding_key_for_demo';

export const apiRouter = express.Router();

apiRouter.use(express.json());
apiRouter.use(cookieParser());

// Simple Auth
apiRouter.post('/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === 'staff123') {
    const token = jwt.sign({ role: 'staff' }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

apiRouter.post('/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

apiRouter.get('/auth/status', (req, res) => {
  try {
    jwt.verify(req.cookies?.auth_token || '', JWT_SECRET);
    res.json({ authenticated: true });
  } catch {
    res.json({ authenticated: false });
  }
});

// Auth middleware for subsequent routes
apiRouter.use((req: any, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) throw new Error('No token');
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Summary stats
apiRouter.get('/summary', (req, res) => {
  const totalRow = db.prepare('SELECT count(*) as count FROM invitations').get() as {count: number};
  const checkedInRow = db.prepare('SELECT count(*) as count FROM check_ins').get() as {count: number};
  
  const total = totalRow.count;
  const checkedIn = checkedInRow.count;
  const remaining = total - checkedIn;
  const rate = total === 0 ? 0 : (checkedIn / total) * 100;
  
  const recent = db.prepare(`
    SELECT g.name, i.invite_number, c.checked_in_at 
    FROM check_ins c
    JOIN invitations i ON c.invitation_id = i.id
    JOIN guests g ON i.guest_id = g.id
    ORDER BY c.checked_in_at DESC
    LIMIT 5
  `).all();
  
  const wedding = db.prepare('SELECT * FROM weddings LIMIT 1').get();
  
  res.json({ total, checkedIn, remaining, rate, recent, wedding });
});

// Guests list (searchable)
apiRouter.get('/guests', (req, res) => {
  const { q } = req.query;
  let query = `
    SELECT i.id, g.name, i.invite_number, i.invitation_code as code, 
           c.checked_in_at
    FROM invitations i
    JOIN guests g ON i.guest_id = g.id
    LEFT JOIN check_ins c ON c.invitation_id = i.id
  `;
  
  if (q) {
    query += ` WHERE g.name LIKE @q OR i.invite_number LIKE @q OR i.invitation_code LIKE @q`;
  }
  
  query += ` ORDER BY g.name ASC`;
  
  const results = db.prepare(query).all(q ? { q: `%${q}%` } : {});
  
  const guests = results.map((r: any) => ({
    id: r.id,
    name: r.name,
    inviteNumber: r.invite_number,
    code: r.code,
    status: r.checked_in_at ? 'checked-in' : 'pending',
    checkedInAt: r.checked_in_at 
      ? new Date(r.checked_in_at + 'Z').toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', hour12: true }) 
      : undefined
  }));
  
  res.json({ guests });
});

// Lookup invitation by code
apiRouter.get('/invitations/:code', (req, res) => {
  const { code } = req.params;
  
  const result = db.prepare(`
    SELECT i.id, g.name, i.invite_number, i.invitation_code as code, c.checked_in_at, w.name as wedding_name
    FROM invitations i
    JOIN guests g ON i.guest_id = g.id
    JOIN weddings w ON i.wedding_id = w.id
    LEFT JOIN check_ins c ON c.invitation_id = i.id
    WHERE i.invitation_code = ?
  `).get(code) as any;
  
  if (!result) {
    return res.status(404).json({ error: 'Invitation not found' });
  }
  
  res.json({
    id: result.id,
    name: result.name,
    inviteNumber: result.invite_number,
    code: result.code,
    weddingName: result.wedding_name,
    status: result.checked_in_at ? 'checked-in' : 'pending',
    checkedInAt: result.checked_in_at 
      ? new Date(result.checked_in_at + 'Z').toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit', hour12: true }) 
      : undefined
  });
});

// Check-in endpoint
apiRouter.post('/checkin', (req, res) => {
  const { code } = req.body;
  
  try {
    const invite = db.prepare('SELECT id FROM invitations WHERE invitation_code = ?').get(code) as { id: string };
    if (!invite) {
      return res.status(404).json({ error: 'Invalid invitation' });
    }
    
    // Attempt to insert check-in, SQLite will throw UNIQUE constraint error if already checked in
    db.prepare('INSERT INTO check_ins (id, invitation_id, checked_in_by) VALUES (?, ?, ?)').run(crypto.randomUUID(), invite.id, 'staff');
    
    res.json({ success: true });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Already checked in' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});
