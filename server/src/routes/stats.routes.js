/**
 * stats.routes.js
 * 
 * Public statistics endpoint.
 * Mirrors the Firebase Cloud Function: getPublicStats
 * 
 * Routes:
 *   GET /api/stats/public  → happyCustomers, vehiclesProtected, installCount
 */

'use strict';

const { Router } = require('express');
const { db }     = require('../firebase-admin');

const router = Router();

const getCount = async (collectionPath, constraints = []) => {
  let ref = db.collection(collectionPath);
  for (const c of constraints) {
    ref = ref.where(c.field, c.op, c.value);
  }
  const snap = await ref.count().get(); // uses Firestore COUNT aggregation (faster)
  return snap.data().count;
};

// ────────────────────────────────────────────────────────────────────────────
// GET /api/stats/public
// Returns aggregate counts used on the homepage.
// ────────────────────────────────────────────────────────────────────────────
router.get('/public', async (req, res) => {
  try {
    const [happyCustomers, vehiclesProtected, installCount] = await Promise.all([
      getCount('users'),
      getCount('booking', [{ field: 'status', op: '==', value: 'confirmed' }]),
      getCount('installs'),
    ]);

    res.json({
      happyCustomers,
      vehiclesProtected,
      citiesCovered: 0,
      googleRating:  0,
      installCount,
    });
  } catch (err) {
    console.error('[Stats] getPublicStats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

module.exports = router;
