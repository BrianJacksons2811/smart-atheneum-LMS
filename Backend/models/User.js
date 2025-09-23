const pool = require('../database');
const bcrypt = require('bcryptjs');

const toPublic = (u) => {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
};

module.exports = {
  async create({ fullName, email, password, role = 'student', gradeCode = null, subjectMain = null, avatar_url = '' }) {
    const password_hash = await bcrypt.hash(password, 12);
    const [r] = await pool.query(
      `INSERT INTO users (role, email, full_name, password_hash, grade_code, subject_main, avatar_url)
       VALUES (:role,:email,:full,:hash,:grade,:subject,:avatar)`,
      { role, email, full: fullName, hash: password_hash, grade: gradeCode, subject: subjectMain, avatar: avatar_url }
    );
    const [rows] = await pool.query(`SELECT * FROM users WHERE id=:id`, { id: r.insertId });
    return toPublic(rows[0]);
  },

  async findByEmail(email) {
    const [rows] = await pool.query(`SELECT * FROM users WHERE email=:email`, { email });
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM users WHERE id=:id`, { id });
    return rows[0] || null;
  },

  async checkPassword(user, candidate) {
    return bcrypt.compare(candidate, user.password_hash);
  },

  async markLogin(id) {
    await pool.query(`UPDATE users SET updated_at=NOW() WHERE id=:id`, { id });
  },

  toPublic
};
