// routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool   = require('../database'); // mysql2/promise pool

const normEmail = v => (v || '').trim().toLowerCase();

/* -------- Optional: preflight to avoid proxy 405s ---------- */
router.options(['/register','/register/','/login','/login/'], (_req, res) => res.sendStatus(204));

/* ---------------------- REGISTER --------------------------- */
// replaces: router.post('/register', /* handler */);
router.post(['/register','/register/'], async (req, res) => {
  try {
    let {
      fullName,
      email,
      password,
      role = 'student',
      gradeCode = null,
      gender = null,
      dob = null
    } = req.body || {};

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
      'INSERT INTO users (full_name, email, password_hash, role, grade_code, gender, dob) VALUES (?,?,?,?,?,?,?)',
      [fullName, email, hash, role, gradeCode, gender, dob]
    );

    // return created user basics
    const [rows] = await pool.query(
      'SELECT id, full_name AS fullName, email, role, grade_code AS gradeCode, gender, dob FROM users WHERE email = ?',
      [email]
    );

    return res.status(201).json({ ok: true, user: rows[0] || { fullName, email, role, gradeCode, gender, dob } });
  } catch (e) {
    console.error('REGISTER error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

/* ------------------------ LOGIN ---------------------------- */
// replaces: router.post('/login', /* handler */);
router.post(['/login','/login/'], async (req, res) => {
  try {
    let { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    email = normEmail(email);

    const [rows] = await pool.query(
      'SELECT id, full_name AS fullName, email, password_hash, role, grade_code AS gradeCode, gender, dob FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length) return res.status(404).json({ message: 'No account found. Please register first.' });

    const u  = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ message: 'Incorrect email or password.' });

    // build response without password_hash
    const user = {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      gradeCode: u.gradeCode,
      gender: u.gender,
      dob: u.dob
    };

    // simple mock token for now (swap for JWT later)
    return res.json({ token: 'mock-token', user });
  } catch (e) {
    console.error('LOGIN error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
