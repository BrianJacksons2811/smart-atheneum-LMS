// server.js  — MySQL / Express edition
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // uses mysql2/promise and your .env
const app = express();

const PORT = process.env.PORT || 4000;

// --- Middleware
app.use(cors());
app.use(express.json());

// --- Health / readiness checks
app.get('/health', (req, res) => res.json({ ok: true }));

// Simple DB ping to confirm MySQL connectivity
app.get('/health/db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: rows?.[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- API routes (make sure these files exist under ./routes/)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/classrooms', require('./routes/classrooms'));
app.use('/api/content', require('./routes/content'));

// If you added the extra routes I shared:
try { app.use('/api/activities', require('./routes/activities')); } catch {}
try { app.use('/api/assignments', require('./routes/assignments')); } catch {}
try { app.use('/api/uploads', require('./routes/uploads')); } catch {}

// --- Start server
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log('Try /health and /health/db');
});

// --- Safety: crash handlers
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});
