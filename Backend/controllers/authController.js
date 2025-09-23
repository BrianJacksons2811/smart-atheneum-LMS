const jwt = require('jsonwebtoken');
const User = require('../models/User');
const pool = require('../database');


const sign = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role, gradeCode, subjectMain } = req.body;

    const exists = await User.findByEmail(email);
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const created = await User.create({ fullName, email, password, role, gradeCode, subjectMain });
    const token = sign(created);
    res.status(201).json({ token, user: created });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const u = await User.findByEmail(email);
    if (!u) return res.status(400).json({ message: 'Invalid credentials' });
    if (role && u.role !== role) return res.status(400).json({ message: 'Role mismatch' });

    const ok = await User.checkPassword(u, password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    await User.markLogin(u.id);
    const token = sign(u);
    res.json({ token, user: User.toPublic(u) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.me = async (req, res) => {
  res.json(User.toPublic(req.user));
};

exports.updateMe = async (req, res) => {
  try {
    const { fullName, avatar_url } = req.body;
    await require('../database').query(
      `UPDATE users SET full_name = COALESCE(:full, full_name),
                        avatar_url = COALESCE(:avatar, avatar_url),
                        updated_at = NOW()
       WHERE id = :id`,
      { full: fullName || null, avatar: avatar_url || null, id: req.user.id }
    );
    const fresh = await User.findById(req.user.id);
    res.json(User.toPublic(fresh));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
