/**
 * authenticate.js
 * 
 * Express middleware that verifies a Firebase ID token passed in the
 * Authorization header as:  "Bearer <idToken>"
 * 
 * On success:  attaches req.user = { uid, email, ...claims }
 * On failure:  responds 401
 * 
 * Usage:
 *   const authenticate = require('./middleware/authenticate');
 *   router.post('/some-protected-route', authenticate, handler);
 * 
 * Optional (allow unauthenticated):
 *   router.post('/route', authenticate({ optional: true }), handler);
 *   // req.user will be null when no token is provided
 */

'use strict';

const { auth } = require('../firebase-admin');

/**
 * @param {object} [options]
 * @param {boolean} [options.optional=false] - If true, missing/invalid tokens
 *   do not produce a 401; req.user is set to null instead.
 * @returns {import('express').RequestHandler}
 */
const authenticate = (options = {}) => async (req, res, next) => {
  const optional = options.optional === true;

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    if (optional) {
      req.user = null;
      return next();
    }
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const idToken = authHeader.slice(7); // strip "Bearer "

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken; // { uid, email, email_verified, name, picture, admin, ... }
    next();
  } catch (err) {
    console.warn('[Auth] Token verification failed:', err.code || err.message);

    if (optional) {
      req.user = null;
      return next();
    }

    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Export as a factory (called with options) AND as a plain middleware
// so both usages work:
//   authenticate           ← plain middleware (required auth)
//   authenticate({ optional: true })  ← factory call (optional auth)
const defaultMiddleware = authenticate(); // required auth shortcut
defaultMiddleware.optional = authenticate({ optional: true });
defaultMiddleware.factory  = authenticate; // full factory

module.exports = defaultMiddleware;
