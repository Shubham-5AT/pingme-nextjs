/**
 * contacts.routes.js
 * 
 * Firestore operations for the "contacts" collection.
 * Mirrors client-side admin contact message management in adminService.ts
 * 
 * Routes:
 *   POST   /api/contacts           → submit contact form (public)
 *   GET    /api/contacts           → list all messages (admin)
 *   PATCH  /api/contacts/:id/read  → mark message as read (admin)
 *   DELETE /api/contacts/:id       → delete message (admin)
 */

'use strict';

const { Router }    = require('express');
const { db, admin } = require('../firebase-admin');
const authenticate  = require('../middleware/authenticate');

const router = Router();

const CONTACTS_COLLECTION = 'contacts';

const sanitize = (v) =>
  typeof v === 'string' ? v.trim().replace(/<[^>]+>/g, '').slice(0, 2000) : '';

const requireAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
  if (req.user.admin === true) return next();
  return res.status(403).json({ error: 'Admin access required' });
};

// ────────────────────────────────────────────────────────────────────────────
// POST /api/contacts          (Public — contact form submission)
// Body: { name, email, phone?, message }
// ────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const docRef = await db.collection(CONTACTS_COLLECTION).add({
      name:      sanitize(name),
      email:     sanitize(email).toLowerCase(),
      phone:     sanitize(phone || ''),
      message:   sanitize(message),
      status:    'unread',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error('[Contacts] submit error:', err);
    res.status(500).json({ error: 'Failed to submit contact message' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/contacts           (Admin only)
// Returns all contact messages ordered by createdAt desc.
// ────────────────────────────────────────────────────────────────────────────
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const snapshot = await db
      .collection(CONTACTS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();

    const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ messages, total: messages.length });
  } catch (err) {
    console.error('[Contacts] list error:', err);
    res.status(500).json({ error: 'Failed to list contact messages' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PATCH /api/contacts/:id/read   (Admin only)
// Mark a contact message as read.
// ────────────────────────────────────────────────────────────────────────────
router.patch('/:id/read', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.collection(CONTACTS_COLLECTION).doc(req.params.id).update({
      status: 'read',
    });
    res.json({ success: true });
  } catch (err) {
    console.error('[Contacts] markRead error:', err);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// DELETE /api/contacts/:id       (Admin only)
// ────────────────────────────────────────────────────────────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.collection(CONTACTS_COLLECTION).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error('[Contacts] delete error:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
