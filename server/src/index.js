/**
 * index.js — PingME Node.js Server
 * 
 * Express server with Firebase Admin SDK connectivity.
 * Replaces Firebase Cloud Functions for self-hosted deployments.
 * 
 * Architecture:
 *   Browser → this Node.js server (Firebase Admin SDK) → Firebase / Firestore
 * 
 * All routes are prefixed with /api
 * 
 * Start: node src/index.js
 * Dev:   npx nodemon src/index.js
 */

'use strict';

// ── Load .env FIRST, before any other require ────────────────────────────────
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

// ── Initialize Firebase Admin (must come after dotenv) ───────────────────────
require('./firebase-admin'); // initializes the singleton

// ── Route modules ─────────────────────────────────────────────────────────────
const authRoutes     = require('./routes/auth.routes');
const usersRoutes    = require('./routes/users.routes');
const ordersRoutes   = require('./routes/orders.routes');
const nfcRoutes      = require('./routes/nfc.routes');
const productsRoutes = require('./routes/products.routes');
const statsRoutes    = require('./routes/stats.routes');
const contactsRoutes = require('./routes/contacts.routes');

// ── App ───────────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 4000;

// ── Parse CORS origins from env ───────────────────────────────────────────────
const rawOrigins    = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // allow curl / server-to-server / no-origin requests
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.web.app'))         return true;
  if (origin.endsWith('.firebaseapp.com')) return true;
  // Always allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  try {
    const url = new URL(origin);
    const h   = url.hostname;
    if (h === 'localhost' || h === '127.0.0.1') return true;
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)\d+\.\d+/.test(h)) return true;
  } catch { /* invalid URL */ }
  return false;
};

// ── Security & Parsing ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options('*', cors()); // pre-flight for all routes
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max:      200,               // max 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'pingme-node-server',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    usersRoutes);
app.use('/api/orders',   ordersRoutes);
app.use('/api/nfc',      nfcRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/stats',    statsRoutes);
app.use('/api/contacts', contactsRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  console.error('[Server Error]', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// ── Resolve host — bind to 0.0.0.0 so other devices on the network can reach it
const HOST = process.env.HOST || '0.0.0.0';

// Detect local network IP for display purposes
const os        = require('os');
const getLocalIP = () => {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'unknown';
};

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log('');
  console.log('  ██████╗ ██╗███╗   ██╗ ██████╗ ███╗   ███╗███████╗');
  console.log('  ██╔══██╗██║████╗  ██║██╔════╝ ████╗ ████║██╔════╝');
  console.log('  ██████╔╝██║██╔██╗ ██║██║  ███╗██╔████╔██║█████╗  ');
  console.log('  ██╔═══╝ ██║██║╚██╗██║██║   ██║██║╚██╔╝██║██╔══╝  ');
  console.log('  ██║     ██║██║ ╚████║╚██████╔╝██║ ╚═╝ ██║███████╗');
  console.log('  ╚═╝     ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝');
  console.log('');
  console.log(`  Local   →  http://localhost:${PORT}`);
  console.log(`  Network →  http://${localIP}:${PORT}`);
  console.log(`  Health  →  http://localhost:${PORT}/health`);
  console.log(`  Env     →  ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Firebase →  ${process.env.FIREBASE_PROJECT_ID || '(not set)'}`);
  console.log('');
});

module.exports = app; // for testing
