// models/Activity.js (MySQL version)
const pool = require('../db');

module.exports = {
  async list({ classroomId = null, limit = 20, offset = 0 } = {}) {
    const [rows] = await pool.query(
      `SELECT id, user_id, classroom_id, subject_name, title, type, metadata, created_at
       FROM activities
       WHERE (:cid IS NULL OR classroom_id=:cid)
       ORDER BY created_at DESC
       LIMIT :limit OFFSET :offset`,
      { cid: classroomId, limit, offset }
    );
    return rows;
  },

  async add({ userId = null, classroomId = null, subjectName = null, title, type, metadata = null }) {
    const [r] = await pool.query(
      `INSERT INTO activities (user_id, classroom_id, subject_name, title, type, metadata)
       VALUES (:uid,:cid,:subj,:title,:type, CAST(:meta AS JSON))`,
      { uid: userId, cid: classroomId, subj: subjectName, title, type, meta: metadata ? JSON.stringify(metadata) : null }
    );
    return r.insertId;
  },

  async remove(id) {
    await pool.query(`DELETE FROM activities WHERE id=:id`, { id });
    return { ok: true };
  }
};
