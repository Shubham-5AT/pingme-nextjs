/**
 * auth.routes.js
 * 
 * Server-side Firebase AUTH operations using the Admin SDK.
 * 
 * All user authentication (login, signup, Google sign-in) still happens
 * client-side via the Firebase JS SDK — the browser talks directly to
 * Firebase Auth. These server routes handle ADMIN operations:
 *   - Verify a token and return decoded claims
 *   - Set / remove admin custom claims
 *   - Get any user's profile
 *   - Disable / enable a user account
 *   - Revoke refresh tokens (force logout)
 * 
 * Routes:
 *   POST /api/auth/verify          → verify ID token, return claims
 *   POST /api/auth/set-admin        → grant admin claim (requires admin)
 *   POST /api/auth/revoke-admin     → remove admin claim (requires admin)
 *   GET  /api/auth/user/:uid        → get user record (requires admin)
 *   POST /api/auth/disable/:uid     → disable user account (requires admin)
 *   POST /api/auth/enable/:uid      → enable user account (requires admin)
 *   POST /api/auth/revoke/:uid      → revoke all refresh tokens (requires admin)
 */

'use strict';

const { Router }   = require('express');
const { auth }     = require('../firebase-admin');
const authenticate = require('../middleware/authenticate');

const router = Router();

// ────────────────────────────────────────────────────────────────────────────
// Helper — check if the currently authenticated user is an admin
// ────────────────────────────────────────────────────────────────────────────
const requireAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });

  if (req.user.admin === true) return next();

  // Double-check via Admin SDK in case claims are stale in the token
  try {
    const userRecord = await auth.getUser(req.user.uid);
    if (userRecord.customClaims?.admin === true) return next();
  } catch { /* ignore */ }

  return res.status(403).json({ error: 'Admin access required' });
};

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify
// Verify an ID token and return the decoded payload.
// The frontend can call this to confirm a token is still valid on the server.
// ────────────────────────────────────────────────────────────────────────────
router.post('/verify', authenticate, (req, res) => {
  // authenticate middleware already verified the token and set req.user
  const { uid, email, email_verified, name, picture, admin: isAdmin } = req.user;
  res.json({
    uid,
    email,
    emailVerified: email_verified,
    displayName:   name,
    photoURL:      picture,
    isAdmin:       isAdmin === true,
  });
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/set-admin
// Body: { uid: string }
// Grant admin custom claim to a user. Only existing admins can call this.
// ────────────────────────────────────────────────────────────────────────────
router.post('/set-admin', authenticate, requireAdmin, async (req, res) => {
  const { uid } = req.body || {};
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'uid is required' });
  }

  try {
    await auth.setCustomUserClaims(uid, { admin: true });
    console.log(`[Auth] Admin claim granted to uid=${uid} by uid=${req.user.uid}`);
    res.json({ success: true, uid, admin: true });
  } catch (err) {
    console.error('[Auth] setCustomUserClaims error:', err);
    res.status(500).json({ error: 'Failed to set admin claim' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/revoke-admin
// Body: { uid: string }
// Remove admin custom claim. Only admins can call this.
// ────────────────────────────────────────────────────────────────────────────
router.post('/revoke-admin', authenticate, requireAdmin, async (req, res) => {
  const { uid } = req.body || {};
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'uid is required' });
  }

  try {
    await auth.setCustomUserClaims(uid, { admin: false });
    console.log(`[Auth] Admin claim revoked from uid=${uid} by uid=${req.user.uid}`);
    res.json({ success: true, uid, admin: false });
  } catch (err) {
    console.error('[Auth] revokeAdmin error:', err);
    res.status(500).json({ error: 'Failed to revoke admin claim' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/auth/user/:uid
// Get a user's Auth record (email, displayName, disabled, customClaims, etc.)
// Requires admin.
// ────────────────────────────────────────────────────────────────────────────
router.get('/user/:uid', authenticate, requireAdmin, async (req, res) => {
  const { uid } = req.params;

  try {
    const userRecord = await auth.getUser(uid);
    res.json({
      uid:          userRecord.uid,
      email:        userRecord.email,
      displayName:  userRecord.displayName,
      photoURL:     userRecord.photoURL,
      disabled:     userRecord.disabled,
      emailVerified: userRecord.emailVerified,
      customClaims: userRecord.customClaims || {},
      createdAt:    userRecord.metadata.creationTime,
      lastSignIn:   userRecord.metadata.lastSignInTime,
    });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('[Auth] getUser error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/disable/:uid
// Disable a user account (they cannot sign in while disabled).
// ────────────────────────────────────────────────────────────────────────────
router.post('/disable/:uid', authenticate, requireAdmin, async (req, res) => {
  const { uid } = req.params;

  try {
    await auth.updateUser(uid, { disabled: true });
    res.json({ success: true, uid, disabled: true });
  } catch (err) {
    console.error('[Auth] disableUser error:', err);
    res.status(500).json({ error: 'Failed to disable user' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/enable/:uid
// Re-enable a disabled user account.
// ────────────────────────────────────────────────────────────────────────────
router.post('/enable/:uid', authenticate, requireAdmin, async (req, res) => {
  const { uid } = req.params;

  try {
    await auth.updateUser(uid, { disabled: false });
    res.json({ success: true, uid, disabled: false });
  } catch (err) {
    console.error('[Auth] enableUser error:', err);
    res.status(500).json({ error: 'Failed to enable user' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/auth/revoke/:uid
// Revoke all refresh tokens — effectively force-logs out all sessions.
// ────────────────────────────────────────────────────────────────────────────
router.post('/revoke/:uid', authenticate, requireAdmin, async (req, res) => {
  const { uid } = req.params;

  try {
    await auth.revokeRefreshTokens(uid);
    res.json({ success: true, uid, message: 'All sessions revoked' });
  } catch (err) {
    console.error('[Auth] revokeRefreshTokens error:', err);
    res.status(500).json({ error: 'Failed to revoke tokens' });
  }
});

module.exports = router;
