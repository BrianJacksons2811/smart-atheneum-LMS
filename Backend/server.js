// server.js — Smart Atheneum API (MySQL Edition)
console.log("[BOOT] Starting Smart Atheneum API…");

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

// MySQL pool
const pool = require('./database'); 

const app = express();
const PORT = process.env.PORT || 4000;

// --- Core middleware
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '2mb' }));

// --- Static site (serve your HTML/CSS/JS from project root or /public)
app.use(express.static(path.join(__dirname, '..')));

// --- Health
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/health/db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: rows?.[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Routes (make sure these files exist and export a router)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/content', require('./routes/content'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/uploads', require('./routes/uploads'));
try { app.use('/api/users', require('./routes/users')); } catch {}

// --- Start
app.listen(PORT, () => {
  console.log(`[READY] API: http://localhost:${PORT}`);
  console.log('Try /health and /health/db');
});

// --- Crash safety
process.on('unhandledRejection', (err) => { console.error('UNHANDLED REJECTION:', err); process.exit(1); });
process.on('uncaughtException',  (err) => { console.error('UNCAUGHT EXCEPTION:',  err); process.exit(1); });
