const File = require('../models/File');
const pool = require('../database');


exports.create = async (req, res) => {
  try {
    const { fileUrl, fileName, mimeType, sizeBytes, provider = 'device' } = req.body;
    if (!fileUrl || !fileName) return res.status(400).json({ message: 'fileUrl and fileName are required' });

    const row = await File.create({
      userId: req.user?.id || null,
      fileName,
      originalName: fileName,
      mimeType,
      sizeBytes,
      fileUrl,
      provider
    });
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
