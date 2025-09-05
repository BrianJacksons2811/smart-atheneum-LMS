const express = require('express');
const { body } = require('express-validator');
const {
  createContent,
  getContent,
  getContentById,
  updateContent,
  deleteContent,
  addFileToContent
} = require('../controllers/contentController');
const { auth, requireRole } = require('../middleware/auth');
const { uploadTextbook } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const contentValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('grade').notEmpty().withMessage('Grade is required')
];

// Routes
router.post('/', auth, requireRole(['teacher', 'admin']), contentValidation, createContent);
router.get('/', auth, getContent);
router.get('/:id', auth, getContentById);
router.put('/:id', auth, requireRole(['teacher', 'admin']), contentValidation, updateContent);
router.delete('/:id', auth, requireRole(['teacher', 'admin']), deleteContent);
router.post('/:id/files', auth, requireRole(['teacher', 'admin']), uploadTextbook, addFileToContent);

module.exports = router;