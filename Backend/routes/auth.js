// routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool   = require('../database'); // mysql2/promise pool

const normEmail = v => (v || '').trim().toLowerCase();

/* -------- Preflight: avoids 405 from proxies/CDNs ---------- */
router.options(['/register','/register/','/login','/login/'], (_req, res) => res.sendStatus(204));

/* ---------------------- REGISTER --------------------------- */
// POST /api/auth/register
router.post(['/register','/register/'], async (req, res) => {
  try {
    let { fullName, email, password, role = 'student', gradeCode = null, dob = null } = req.body || {};
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    email = normEmail(email);

    // already exists?
    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length) return res.status(409).json({ message: 'Account already exists.' });

    // hash + insert
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role, grade_code, dob) VALUES (?,?,?,?,?,?)',
      [fullName, email, hash, role, gradeCode, dob]
    );

    // fetch minimal profile
    const [rows] = await pool.query(
      'SELECT id, full_name AS fullName, email, role, grade_code AS gradeCode, dob FROM users WHERE email = ?',
      [email]
    );

    return res.status(201).json({ ok: true, user: rows[0] || { fullName, email, role, gradeCode, dob } });
  } catch (e) {
    console.error('REGISTER error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

/* ------------------------ LOGIN ---------------------------- */
// POST /api/auth/login
router.post(['/login','/login/'], async (req, res) => {
  try {
    let { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    email = normEmail(email);

    const [rows] = await pool.query(
      'SELECT id, full_name AS fullName, email, password_hash, role, grade_code AS gradeCode, dob FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length) return res.status(404).json({ message: 'No account found. Please register first.' });

    const u  = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ message: 'Incorrect email or password.' });

    const user = {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      gradeCode: u.gradeCode,
      dob: u.dob
    };

    // mock token for now; swap for JWT later if needed
    return res.json({ token: 'mock-token', user });
  } catch (e) {
    console.error('LOGIN error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

const { register: registerHandler, login: loginHandler } = require('../authController');

// Handle CORS preflight (avoids 405 on some hosts/CDNs)
router.options(['/register','/register/','/login','/login/'], (_req, res) => res.sendStatus(204));

// Accept both with/without trailing slash
router.post(['/register','/register/'], registerHandler);
router.post(['/login','/login/'],     loginHandler);

module.exports = router;


module.exports = router;
