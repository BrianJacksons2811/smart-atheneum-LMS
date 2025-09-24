// routes/auth.js
const express = require("express");
const bcrypt  = require("bcryptjs");
const router  = express.Router();
const pool    = require("../database"); // mysql2/promise pool

const normalizeEmail = (v) => (v || "").trim().toLowerCase();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    let { fullName, email, password, role = "student", gradeCode = null, dob = null } = req.body || {};
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    email = normalizeEmail(email);

    // Check if user exists
    const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) {
      return res.status(409).json({ message: "Account already exists." });
    }

    // Hash password and insert
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role, grade_code, dob) VALUES (?,?,?,?,?,?)",
      [fullName, email, hash, role, gradeCode, dob]
    );

    // Fetch created user to return minimal profile
    const [rows] = await pool.query(
      "SELECT id, full_name AS fullName, email, role, grade_code AS gradeCode, dob FROM users WHERE email = ?",
      [email]
    );

    return res.status(201).json({ ok: true, user: rows[0] || { fullName, email, role, gradeCode, dob } });
  } catch (e) {
    console.error("REGISTER error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    email = normalizeEmail(email);

    const [rows] = await pool.query(
      "SELECT id, full_name AS fullName, email, password_hash, role, grade_code AS gradeCode, dob FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No account found. Please register first." });
    }

    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    // Build response user without password_hash
    const user = {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      gradeCode: u.gradeCode,
      dob: u.dob
    };

    // Issue a simple mock token for now (replace with JWT later if needed)
    return res.json({ token: "mock-token", user });
  } catch (e) {
    console.error("LOGIN error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
