/**
 * users.routes.js
 * 
 * Server-side Firestore operations for the "users" collection.
 * Mirrors everything in the client-side lib/userService.ts
 * but runs with Admin SDK (bypasses Firestore security rules).
 * 
 * Routes:
 *   GET    /api/users/me             → get own profile (authenticated)
 *   PUT    /api/users/me             → update own profile (authenticated)
 *   PUT    /api/users/me/addresses   → update delivery addresses (authenticated)
 *   PUT    /api/users/me/email       → update email field in Firestore (authenticated)
 *   POST   /api/users/me/sync-email-verification → sync emailVerified flag
 *   GET    /api/users/:uid           → get any user profile (admin only)
 *   GET    /api/users                → list all users (admin only)
 */

'use strict';

const { Router }             = require('express');
const { db, admin }          = require('../firebase-admin');
const authenticate           = require('../middleware/authenticate');

const router = Router();

const USERS_COLLECTION = 'users';

// ── Helper ───────────────────────────────────────────────────────────────────
const requireAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
  if (req.user.admin === true) return next();
  return res.status(403).json({ error: 'Admin access required' });
};

const toUserProfile = (id, data) => ({ uid: id, ...data });

// ────────────────────────────────────────────────────────────────────────────
// GET /api/users/me
// Returns the authenticated user's Firestore profile document.
// ────────────────────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const snap = await db.collection(USERS_COLLECTION).doc(req.user.uid).get();

    if (!snap.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(toUserProfile(snap.id, snap.data()));
  } catch (err) {
    console.error('[Users] getProfile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PUT /api/users/me
// Body: { displayName?, mobile? }
// Update the authenticated user's own profile.
// ────────────────────────────────────────────────────────────────────────────
router.put('/me', authenticate, async (req, res) => {
  const { displayName, mobile } = req.body || {};

  const update = {};
  if (typeof displayName === 'string') update.displayName = displayName.trim();
  if (typeof mobile      === 'string') update.mobile      = mobile.trim();

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  update.updatedAt = admin.firestore.FieldValue.serverTimestamp();

  try {
    await db.collection(USERS_COLLECTION).doc(req.user.uid).update(update);
    res.json({ success: true, updated: update });
  } catch (err) {
    console.error('[Users] updateProfile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PUT /api/users/me/addresses
// Body: { addresses: DeliveryAddress[] }
// Replace the user's saved delivery addresses.
// ────────────────────────────────────────────────────────────────────────────
router.put('/me/addresses', authenticate, async (req, res) => {
  const { addresses } = req.body || {};

  if (!Array.isArray(addresses)) {
    return res.status(400).json({ error: 'addresses must be an array' });
  }

  try {
    await db.collection(USERS_COLLECTION).doc(req.user.uid).update({
      addresses,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error('[Users] updateAddresses error:', err);
    res.status(500).json({ error: 'Failed to update addresses' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PUT /api/users/me/email
// Body: { email: string }
// Update the email field in Firestore (called AFTER Firebase Auth email change).
// ────────────────────────────────────────────────────────────────────────────
router.put('/me/email', authenticate, async (req, res) => {
  const { email } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email is required' });
  }

  try {
    await db.collection(USERS_COLLECTION).doc(req.user.uid).update({
      email:         email.trim().toLowerCase(),
      emailVerified: false,
      updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error('[Users] updateEmail error:', err);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/users/me/sync-email-verification
// Body: { emailVerified: boolean }
// Sync the emailVerified flag from Firebase Auth into Firestore.
// ────────────────────────────────────────────────────────────────────────────
router.post('/me/sync-email-verification', authenticate, async (req, res) => {
  const { emailVerified } = req.body || {};

  if (typeof emailVerified !== 'boolean') {
    return res.status(400).json({ error: 'emailVerified (boolean) is required' });
  }

  try {
    await db.collection(USERS_COLLECTION).doc(req.user.uid).update({
      emailVerified,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, emailVerified });
  } catch (err) {
    console.error('[Users] syncEmailVerification error:', err);
    res.status(500).json({ error: 'Failed to sync email verification' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/users
// Body: { uid, email, displayName, mobile?, photoURL?, authProvider }
// Create a new user profile document in Firestore.
// Called after signup when the client already has the Firebase UID.
// ────────────────────────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  const { uid, email, displayName, mobile, photoURL, authProvider } = req.body || {};

  // Users can only create their own profile document
  if (uid !== req.user.uid) {
    return res.status(403).json({ error: 'You can only create your own profile' });
  }

  if (!email || !displayName || !authProvider) {
    return res.status(400).json({ error: 'email, displayName, and authProvider are required' });
  }

  try {
    const userRef = db.collection(USERS_COLLECTION).doc(uid);
    const existing = await userRef.get();

    if (existing.exists) {
      return res.status(409).json({ error: 'Profile already exists' });
    }

    await userRef.set({
      uid,
      email:         email.trim().toLowerCase(),
      emailVerified: authProvider === 'google',
      displayName:   displayName.trim(),
      mobile:        (mobile || '').trim(),
      photoURL:      photoURL || null,
      authProvider,
      createdAt:     admin.firestore.FieldValue.serverTimestamp(),
      updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ success: true, uid });
  } catch (err) {
    console.error('[Users] createProfile error:', err);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/users/:uid       (Admin only)
// Get any user's Firestore profile by UID.
// ────────────────────────────────────────────────────────────────────────────
router.get('/:uid', authenticate, requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection(USERS_COLLECTION).doc(req.params.uid).get();

    if (!snap.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(toUserProfile(snap.id, snap.data()));
  } catch (err) {
    console.error('[Users] getUser error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/users            (Admin only)
// List all users ordered by createdAt desc.
// ────────────────────────────────────────────────────────────────────────────
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const snapshot = await db
      .collection(USERS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();

    const users = snapshot.docs.map(d => toUserProfile(d.id, d.data()));
    res.json({ users, total: users.length });
  } catch (err) {
    console.error('[Users] listUsers error:', err);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

module.exports = router;
