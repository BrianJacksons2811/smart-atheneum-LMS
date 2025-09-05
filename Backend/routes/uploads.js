const express = require('express');
const { body } = require('express-validator');
const {
  uploadTextbook,
  uploadExam,
  uploadVideo,
  uploadRecording
} = require('../controllers/uploadController');
const { auth, requireRole } = require('../middleware/auth');
const {
  uploadTextbook: uploadTextbookMiddleware,
  uploadExam: uploadExamMiddleware,
  uploadVideo: uploadVideoMiddleware,
  uploadRecording: uploadRecordingMiddleware
} = require('../middleware/upload');

const router = express.Router();

// Validation rules
const uploadValidation = [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('grade').notEmpty().withMessage('Grade is required')
];

// Routes
router.post('/textbook', auth, requireRole(['teacher', 'admin']), uploadValidation, uploadTextbookMiddleware, uploadTextbook);
router.post('/exam', auth, requireRole(['teacher', 'admin']), uploadValidation, uploadExamMiddleware, uploadExam);
router.post('/video', auth, requireRole(['teacher', 'admin']), uploadValidation, uploadVideoMiddleware, uploadVideo);
router.post('/recording', auth, requireRole(['teacher', 'admin']), uploadValidation, uploadRecordingMiddleware, uploadRecording);

module.exports = router;
    