import { db, initDB } from './db.js';
import crypto from 'crypto';

initDB();

const weddingId = 'wedding_1';

// Check if seeded
const existing = db.prepare('SELECT count(*) as count FROM weddings').get() as { count: number };
if (existing.count === 0) {
  // Insert wedding
  db.prepare(`
    INSERT INTO weddings (id, name, date, venue)
    VALUES (?, ?, ?, ?)
  `).run(
    weddingId,
    'Adunola & Babatunde',
    'Saturday, 14th November 2026',
    'Eko Hotels & Suites, Lagos'
  );

  const initialGuests = [
    { name: 'Oluwaseun Adeyemi', inviteNumber: 'Invite #1', code: 'WED-001', checkedIn: false },
    { name: 'Taiwo Okonkwo', inviteNumber: 'Invite #2', code: 'WED-002', checkedIn: false },
    { name: 'Funmilayo Abiodun', inviteNumber: 'Invite #3', code: 'WED-003', checkedIn: false },
    { name: 'Yetunde Fashola', inviteNumber: 'Invite #4', code: 'WED-004', checkedIn: true, time: '2026-11-14T18:14:00Z' },
    { name: 'Babajide Oduya', inviteNumber: 'Invite #5', code: 'WED-005', checkedIn: true, time: '2026-11-14T18:22:00Z' },
    { name: 'Omotunde Salami', inviteNumber: 'Invite #6', code: 'WED-006', checkedIn: false },
    { name: 'Kehinde Adegboyega', inviteNumber: 'Invite #7', code: 'WED-007', checkedIn: true, time: '2026-11-14T18:31:00Z' },
    { name: 'Adaeze Nwosu', inviteNumber: 'Invite #8', code: 'WED-008', checkedIn: false },
    { name: 'Rotimi Olawale', inviteNumber: 'Invite #9', code: 'WED-009', checkedIn: false },
    { name: 'Sade Okunade', inviteNumber: 'Invite #10', code: 'WED-010', checkedIn: true, time: '2026-11-14T18:45:00Z' },
    { name: 'Emeka Obi', inviteNumber: 'Invite #11', code: 'WED-011', checkedIn: false },
    { name: 'Damilola Afolabi', inviteNumber: 'Invite #12', code: 'WED-012', checkedIn: true, time: '2026-11-14T19:02:00Z' },
  ];

  for (const guest of initialGuests) {
    const guestId = crypto.randomUUID();
    const invId = crypto.randomUUID();
    
    db.prepare('INSERT INTO guests (id, wedding_id, name) VALUES (?, ?, ?)').run(guestId, weddingId, guest.name);
    db.prepare('INSERT INTO invitations (id, wedding_id, guest_id, invite_number, invitation_code) VALUES (?, ?, ?, ?, ?)').run(invId, weddingId, guestId, guest.inviteNumber, guest.code);
    
    if (guest.checkedIn) {
      db.prepare('INSERT INTO check_ins (id, invitation_id, checked_in_at, checked_in_by) VALUES (?, ?, ?, ?)').run(crypto.randomUUID(), invId, guest.time, 'staff_seed');
    }
  }
  
  console.log('Database seeded successfully.');
} else {
  console.log('Database already seeded.');
}
