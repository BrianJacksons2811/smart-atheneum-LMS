const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const contentCtl = require('../controllers/contentController');
const up = require('../middleware/upload');
router.get('/', auth, contentCtl.getContent);
router.post('/', auth, requireRole(['teacher','admin']), contentCtl.createContent);
router.get('/:id', auth, contentCtl.getContentById);
router.patch('/:id', auth, requireRole(['teacher','admin']), contentCtl.updateContent);
router.delete('/:id', auth, requireRole(['teacher','admin']), contentCtl.deleteContent);
router.post('/:id/textbook', auth, requireRole(['teacher','admin']), up.uploadTextbook, contentCtl.addFileToContent);
router.post('/:id/exam', auth, requireRole(['teacher','admin']), up.uploadExam, contentCtl.addFileToContent);
router.post('/:id/video', auth, requireRole(['teacher','admin']), up.uploadVideo, contentCtl.addFileToContent);
router.post('/:id/recording', auth, requireRole(['teacher','admin']), up.uploadRecording, contentCtl.addFileToContent);
module.exports = router;

// --- Google Drive → Content (add-only) -------------------------------
function extractDriveId(url) {
  if (!url) return null;
  // supports /file/d/<id>/..., open?id=<id>, and bare 25+ char ids
  const m =
    url.match(/\/d\/([-\w]{25,})/) ||
    url.match(/[?&]id=([-\w]{25,})/) ||
    url.match(/([-\w]{25,})/);
  return m ? m[1] : null;
}

let Content;
try { Content = require('../models/Content'); } catch (e) {
  Content = require('../Content');
}

/**
 * POST /api/content/drive
 * Body: { subject, topic?, title, url, tags?, description?, level? }
 * Auth: teacher/admin
 */
router.post('/drive', auth, requireRole(['teacher', 'admin']), async (req, res) => {
  try {
    const { subject = '', topic = '', title = '', url = '', tags = '', description = '', level = '' } = req.body || {};
    if (!subject || !title || !url) {
      return res.status(400).json({ message: 'subject, title and url are required' });
    }

    const fileId = extractDriveId(url);
    if (!fileId) return res.status(400).json({ message: 'Invalid Google Drive link' });

    // Direct download + preview
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const previewUrl  = `https://drive.google.com/file/d/${fileId}/preview`;

    // Save a Content doc (fields align with your existing schema)
    const doc = await Content.create({
      title,
      topic,
      description,
      subject,
      grade: level,
      tags: (tags || '').split(';').filter(Boolean),
      fileUrls: [downloadUrl],
      previewUrl,
      createdBy: req.user?._id
    });

    return res.json({ message: 'Saved', content: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});
