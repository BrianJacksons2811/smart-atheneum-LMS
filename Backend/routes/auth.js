// routes/auth.js
const express = require("express");
const bcrypt  = require("bcryptjs");
const router  = express.Router();
const pool    = require("../database"); // mysql2/promise pool

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role="student", gradeCode=null, dob=null } = req.body || {};
    if (!fullName || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) return res.status(409).json({ message: "Account already exists." });

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role, grade_code, dob) VALUES (?,?,?,?,?,?)",
      [fullName, email, hash, role, gradeCode, dob]
    );
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error("REGISTER error:", e.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

    const [rows] = await pool.query("SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(404).json({ message: "No account found." });

    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ message: "Incorrect email or password." });

    return res.json({ token: "mock-token", user: { id: u.id, email: u.email, role: u.role, fullName: u.full_name } });
  } catch (e) {
    console.error("LOGIN error:", e.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
