// models/User.js  
const pool = require('../db');
const bcrypt = require('bcryptjs');

function toPublic(u) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}

module.exports = {
  // Create user (student/teacher/admin)
  async create({
    firstName, lastName, email, password, role = 'student',
    grade = null, subject = null, avatar = ''
  }) {
    const full_name = `${firstName} ${lastName}`.trim();
    const password_hash = await bcrypt.hash(password, 12);

    const [r] = await pool.query(
      `INSERT INTO users (role,email,full_name,password_hash,grade_code,subject_main,avatar_url)
       VALUES (:role,:email,:full_name,:password_hash,:grade,:subject,:avatar)`,
      { role, email, full_name, password_hash, grade, subject, avatar }
    );
    const [rows] = await pool.query(
      `SELECT id, role, email, full_name, grade_code, subject_main, avatar_url
       FROM users WHERE id=:id`, { id: r.insertId }
    );
    return toPublic(rows[0]);
  },

  async findByEmail(email) {
    const [rows] = await pool.query(`SELECT * FROM users WHERE email=:email`, { email });
    return rows[0] || null;
  },

  async checkPassword(user, candidate) {
    return bcrypt.compare(candidate, user.password_hash);
  },

  async markLogin(userId) {
    await pool.query(`UPDATE users SET updated_at=NOW() WHERE id=:id`, { id: userId });
  },

  toPublic
};
