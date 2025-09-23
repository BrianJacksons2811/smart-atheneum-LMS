const Activity = require('../models/Activity');
const pool = require('../database');


exports.list = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const offset = parseInt(req.query.offset || '0', 10);
    const classroomId = req.query.classroomId ? Number(req.query.classroomId) : null;
    const rows = await Activity.list({ classroomId, limit, offset });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.add = async (req, res) => {
  try {
    const { classroomId = null, subjectName = null, title, type, metadata = null } = req.body;
    if (!title || !type) return res.status(400).json({ message: 'title and type are required' });
    const id = await Activity.add({
      userId: req.user?.id || null,
      classroomId,
      subjectName,
      title,
      type,
      metadata
    });
    res.status(201).json({ id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
