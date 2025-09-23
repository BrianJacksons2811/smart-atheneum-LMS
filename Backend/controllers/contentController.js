const Content = require('../models/Content');
const pool = require('../database');


exports.list = async (req, res) => {
  try {
    const classroomId = Number(req.query.classroomId);
    if (!classroomId) return res.status(400).json({ message: 'classroomId is required' });
    const type = req.query.type || null;
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 200);
    const offset = parseInt(req.query.offset || '0', 10);
    const rows = await Content.listByClassroom(classroomId, type, limit, offset);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { classroomId, title, type, description = null, url = null } = req.body;
    if (!classroomId || !title || !type) {
      return res.status(400).json({ message: 'classroomId, title, type are required' });
    }
    const row = await Content.create({
      classroomId,
      title,
      type,
      description,
      url,
      createdBy: req.user?.id || null
    });
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
