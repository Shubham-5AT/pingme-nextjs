/**
 * orders.routes.js
 * 
 * Server-side Firestore operations for orders / bookings / prebookings.
 * Mirrors client-side lib/adminService.ts and lib/prebookService.ts
 * 
 * Routes:
 *   GET    /api/orders                     → list all orders (admin)
 *   GET    /api/orders/my                  → get current user's orders
 *   GET    /api/orders/:id                 → get single order (admin or owner)
 *   PATCH  /api/orders/:id/status          → update order status (admin)
 *   DELETE /api/orders/:id                 → delete order (admin)
 *   POST   /api/orders                     → create a new booking (authenticated)
 *   PATCH  /api/orders/:id/nfc-profile     → update NFC profile on an order
 */

'use strict';

const { Router }    = require('express');
const { db, admin } = require('../firebase-admin');
const authenticate  = require('../middleware/authenticate');

const router = Router();

const BOOKING_COLLECTION  = 'booking';
const LEGACY_COLLECTION   = 'prebookings';
const VALID_STATUSES      = ['pending', 'confirmed', 'cancelled'];

// ── Helpers ──────────────────────────────────────────────────────────────────

const requireAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
  if (req.user.admin === true) return next();
  return res.status(403).json({ error: 'Admin access required' });
};

const toMillis = (ts) => {
  if (!ts) return 0;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof ts.seconds  === 'number')   return ts.seconds * 1000;
  return 0;
};

const mapDoc = (snap) => ({ id: snap.id, ...snap.data() });

const mergeAndSort = (orders) => {
  const map = new Map();
  orders.forEach(o => map.set(o.id, o));
  return Array.from(map.values()).sort(
    (a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)
  );
};

const sanitizeText = (v) =>
  typeof v === 'string' ? v.trim().replace(/<[^>]+>/g, '') : '';

// ────────────────────────────────────────────────────────────────────────────
// GET /api/orders             (Admin only)
// Returns all orders merged from booking + legacy prebookings collections.
// ────────────────────────────────────────────────────────────────────────────
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const [bookingSnap, legacySnap] = await Promise.all([
      db.collection(BOOKING_COLLECTION).get(),
      db.collection(LEGACY_COLLECTION).get(),
    ]);

    const orders = mergeAndSort([
      ...bookingSnap.docs.map(mapDoc),
      ...legacySnap.docs.map(mapDoc),
    ]);

    res.json({ orders, total: orders.length });
  } catch (err) {
    console.error('[Orders] listAll error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/orders/my          (Authenticated)
// Returns orders belonging to the currently logged-in user.
// Tries userId first, then falls back to email.
// ────────────────────────────────────────────────────────────────────────────
router.get('/my', authenticate, async (req, res) => {
  const uid   = req.user.uid;
  const email = req.user.email || '';

  try {
    // Query by userId
    const [bByUid, lByUid] = await Promise.all([
      db.collection(BOOKING_COLLECTION).where('userId', '==', uid).get(),
      db.collection(LEGACY_COLLECTION).where('userId',  '==', uid).get(),
    ]);

    let orders = mergeAndSort([
      ...bByUid.docs.map(mapDoc),
      ...lByUid.docs.map(mapDoc),
    ]);

    // Fallback to email if no userId matches
    if (orders.length === 0 && email) {
      const [bByEmail, lByEmail] = await Promise.all([
        db.collection(BOOKING_COLLECTION).where('email', '==', email).get(),
        db.collection(LEGACY_COLLECTION).where('email',  '==', email).get(),
      ]);
      orders = mergeAndSort([
        ...bByEmail.docs.map(mapDoc),
        ...lByEmail.docs.map(mapDoc),
      ]);
    }

    res.json({ orders, total: orders.length });
  } catch (err) {
    console.error('[Orders] listMy error:', err);
    res.status(500).json({ error: 'Failed to fetch your orders' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id         (Admin or owner)
// ────────────────────────────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    // Check primary collection first, then legacy
    let snap = await db.collection(BOOKING_COLLECTION).doc(id).get();
    if (!snap.exists) snap = await db.collection(LEGACY_COLLECTION).doc(id).get();

    if (!snap.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = mapDoc(snap);

    // Only admin or the order owner can view
    const isOwner = order.userId === req.user.uid || order.email === req.user.email;
    const isAdmin = req.user.admin === true;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    console.error('[Orders] getOne error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/orders            (Authenticated)
// Create a new booking document.
// Body: PrebookingData shape (items, fullName, email, phone, address, etc.)
// ────────────────────────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  const body = req.body || {};

  // Basic validation
  const required = ['items', 'fullName', 'phone', 'address', 'city', 'state', 'pincode'];
  for (const field of required) {
    if (!body[field]) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return res.status(400).json({ error: 'items array is required and must not be empty' });
  }

  try {
    const docData = {
      userId:      req.user.uid,
      items:       body.items,
      totalAmount: Number(body.totalAmount) || 0,
      fullName:    sanitizeText(body.fullName),
      email:       sanitizeText(body.email || req.user.email || ''),
      phone:       sanitizeText(body.phone),
      address:     sanitizeText(body.address),
      city:        sanitizeText(body.city),
      state:       sanitizeText(body.state),
      pincode:     sanitizeText(body.pincode),
      status:      'pending',
      createdAt:   admin.firestore.FieldValue.serverTimestamp(),
      updatedAt:   admin.firestore.FieldValue.serverTimestamp(),
      ...(body.nfcProfile     ? { nfcProfile:     body.nfcProfile }     : {}),
      ...(body.nfcLineProfiles ? { nfcLineProfiles: body.nfcLineProfiles } : {}),
      ...(body.payment         ? { payment:         body.payment }         : {}),
    };

    const docRef = await db.collection(BOOKING_COLLECTION).add(docData);
    res.status(201).json({ success: true, orderId: docRef.id });
  } catch (err) {
    console.error('[Orders] create error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/status     (Admin only)
// Body: { status: 'pending' | 'confirmed' | 'cancelled' }
// ────────────────────────────────────────────────────────────────────────────
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { id }     = req.params;
  const { status } = req.body || {};

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    const update = { status, updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    // Update both collections — at least one must succeed
    const results = await Promise.allSettled([
      db.collection(BOOKING_COLLECTION).doc(id).update(update),
      db.collection(LEGACY_COLLECTION).doc(id).update(update),
    ]);

    const anySucceeded = results.some(r => r.status === 'fulfilled');
    if (!anySucceeded) {
      throw (results[0].reason || new Error('Both writes failed'));
    }

    res.json({ success: true, id, status });
  } catch (err) {
    console.error('[Orders] updateStatus error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// DELETE /api/orders/:id      (Admin only)
// ────────────────────────────────────────────────────────────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await Promise.allSettled([
      db.collection(BOOKING_COLLECTION).doc(id).delete(),
      db.collection(LEGACY_COLLECTION).doc(id).delete(),
    ]);

    res.json({ success: true, id });
  } catch (err) {
    console.error('[Orders] delete error:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/nfc-profile   (Authenticated — owner or admin)
// Body: { nfcProfile: NFCProfile, lineKey?: string }
// Update the NFC profile on an existing order.
// ────────────────────────────────────────────────────────────────────────────
router.patch('/:id/nfc-profile', authenticate, async (req, res) => {
  const { id }                   = req.params;
  const { nfcProfile, lineKey }  = req.body || {};

  if (!nfcProfile || typeof nfcProfile !== 'object') {
    return res.status(400).json({ error: 'nfcProfile is required' });
  }

  try {
    // Fetch current order to verify ownership
    let snap = await db.collection(BOOKING_COLLECTION).doc(id).get();
    if (!snap.exists) snap = await db.collection(LEGACY_COLLECTION).doc(id).get();

    if (!snap.exists) return res.status(404).json({ error: 'Order not found' });

    const order  = snap.data();
    const isOwner = order.userId === req.user.uid || order.email === req.user.email;
    const isAdmin = req.user.admin === true;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let updatePayload;

    if (lineKey) {
      // Update one specific NFC profile within nfcLineProfiles array
      const existingLines = Array.isArray(order.nfcLineProfiles) ? order.nfcLineProfiles : [];
      const lineExists    = existingLines.some(l => l.lineKey === lineKey);

      const updatedLines = lineExists
        ? existingLines.map(l => l.lineKey === lineKey ? { ...l, nfcProfile } : l)
        : [...existingLines, { lineKey, itemId: lineKey.split('__')[0], title: 'NFC Card', nfcProfile }];

      updatePayload = {
        nfcLineProfiles: updatedLines,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (updatedLines.length === 1) {
        updatePayload.nfcProfile = nfcProfile;
      }
    } else {
      updatePayload = {
        nfcProfile,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
    }

    const results = await Promise.allSettled([
      db.collection(BOOKING_COLLECTION).doc(id).update(updatePayload),
      db.collection(LEGACY_COLLECTION).doc(id).update(updatePayload),
    ]);

    const anySucceeded = results.some(r => r.status === 'fulfilled');
    if (!anySucceeded) throw new Error('Both writes failed');

    res.json({ success: true });
  } catch (err) {
    console.error('[Orders] updateNfcProfile error:', err);
    res.status(500).json({ error: 'Failed to update NFC profile' });
  }
});

module.exports = router;
