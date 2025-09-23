// models/Content.js 
const pool = require('../database');


module.exports = {
  // list by classroom 
  async listByClassroom(classroomId, type = null, limit = 100, offset = 0) {
    const [rows] = await pool.query(
      `SELECT id, classroom_id, title, type, description, url, created_by, created_at
       FROM content_items
       WHERE classroom_id = :cid AND (:type IS NULL OR type = :type)
       ORDER BY created_at DESC
       LIMIT :limit OFFSET :offset`,
      { cid: classroomId, type, limit, offset }
    );
    return rows;
  },

  // create one content record
  async create({ classroomId, title, type, description = null, url = null, createdBy = null }) {
    const [r] = await pool.query(
      `INSERT INTO content_items (classroom_id,title,type,description,url,created_by)
       VALUES (:cid,:title,:type,:desc,:url,:uid)`,
      { cid: classroomId, title, type, desc: description, url, uid: createdBy }
    );
    const [rows] = await pool.query(
      `SELECT id, classroom_id, title, type, description, url, created_by, created_at
       FROM content_items WHERE id=:id`,
      { id: r.insertId }
    );
    return rows[0];
  },

  async addFile(contentId, { fileUrl, previewUrl = null, storageProvider = 'device' }) {
    const [r] = await pool.query(
      `INSERT INTO content_files (content_id,file_url,preview_url,storage_provider)
       VALUES (:cid,:file,:preview,:prov)`,
      { cid: contentId, file: fileUrl, preview: previewUrl, prov: storageProvider }
    );
    return r.insertId;
  }
};
