// models/File.js 
const pool = require('../database');

module.exports = {
  async create({
    userId, fileName, originalName, mimeType, sizeBytes, fileUrl,
    provider = 'device'
  }) {
    const [r] = await pool.query(
      `INSERT INTO uploads (user_id,file_name,file_url,mime_type,size_bytes,provider)
       VALUES (:uid,:name,:url,:mime,:size,:prov)`,
      { uid: userId, name: originalName || fileName, url: fileUrl, mime: mimeType, size: sizeBytes, prov: provider }
    );
    const [rows] = await pool.query(
      `SELECT id, user_id, file_name, file_url, mime_type, size_bytes, provider, created_at
       FROM uploads WHERE id=:id`, { id: r.insertId }
    );
    return rows[0];
  },

  async listByUser(userId, limit = 100, offset = 0) {
    const [rows] = await pool.query(
      `SELECT id, user_id, file_name, file_url, mime_type, size_bytes, provider, created_at
       FROM uploads
       WHERE (:uid IS NULL OR user_id=:uid)
       ORDER BY created_at DESC
       LIMIT :limit OFFSET :offset`,
      { uid: userId || null, limit, offset }
    );
    return rows;
  },

  async remove(id, requester) {
    
    await pool.query(`DELETE FROM uploads WHERE id=:id`, { id });
    return { ok: true };
  }
};
