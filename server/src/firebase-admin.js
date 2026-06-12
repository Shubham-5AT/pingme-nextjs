/**
 * firebase-admin.js
 * 
 * Initializes the Firebase Admin SDK once and exports
 * auth, firestore (db), and storage for use across all routes.
 * 
 * Uses the service account for full admin privileges:
 *   - Verify Firebase ID tokens  (auth.verifyIdToken)
 *   - Read / write Firestore     (db.collection(...))
 *   - Upload / delete Storage    (storage.bucket(...))
 *   - Manage users               (auth.getUser, auth.setCustomUserClaims)
 */

'use strict';

const admin = require('firebase-admin');
const path  = require('path');

// ── Guard against double-initialization (e.g. nodemon hot reload) ──────────
if (admin.apps.length > 0) {
  module.exports = {
    admin,
    auth:    admin.auth(),
    db:      admin.firestore(),
    storage: admin.storage(),
  };
  return; // already initialized — skip the rest
}

// ── Resolve service account credentials ────────────────────────────────────
let credential;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  // Option A: full JSON string in environment variable (ideal for VPS / Docker)
  try {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    credential = admin.credential.cert(parsed);
    console.log('[Firebase Admin] Initialized from FIREBASE_SERVICE_ACCOUNT_JSON env var');
  } catch (err) {
    throw new Error(
      '[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON.\n' + err.message
    );
  }

} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  // Option B: path to a JSON file on disk
  const resolvedPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  try {
    const serviceAccount = require(resolvedPath);
    credential = admin.credential.cert(serviceAccount);
    console.log(`[Firebase Admin] Initialized from file: ${resolvedPath}`);
  } catch (err) {
    throw new Error(
      `[Firebase Admin] Cannot load service account from ${resolvedPath}.\n` + err.message
    );
  }

} else {
  // Option C: Application Default Credentials (works on Google Cloud / GCP automatically)
  credential = admin.credential.applicationDefault();
  console.log('[Firebase Admin] Initialized using Application Default Credentials');
}

// ── Initialize the app ──────────────────────────────────────────────────────
admin.initializeApp({
  credential,
  projectId:     process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

// ── Configure Firestore settings ────────────────────────────────────────────
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true }); // mirrors client SDK behaviour

// ── Export shared instances ─────────────────────────────────────────────────
module.exports = {
  admin,
  auth:    admin.auth(),
  db,
  storage: admin.storage(),
};
