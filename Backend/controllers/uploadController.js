const File = require('../models/File');
const Activity = require('../models/Activity');

// Upload textbook
exports.uploadTextbook = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { subject, grade } = req.body;
    
    // Create file record
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploader: req.user._id,
      type: 'textbook',
      subject,
      grade
    });
    
    await file.save();
    
    // Log activity
    const activity = new Activity({
      user: req.user._id,
      type: 'file_upload',
      title: `Uploaded textbook: ${req.file.originalname}`,
      resourceType: 'file',
      resourceId: file._id,
      metadata: {
        subject,
        grade,
        fileType: 'textbook'
      }
    });
    
    await activity.save();
    
    res.status(201).json({
      message: 'Textbook uploaded successfully',
      file
    });
  } catch (error) {
    console.error('Upload textbook error:', error);
    res.status(500).json({ message: 'Server error uploading textbook' });
  }
};

// Upload exam
exports.uploadExam = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { subject, grade } = req.body;
    
    // Create file record
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploader: req.user._id,
      type: 'exam',
      subject,
      grade
    });
    
    await file.save();
    
    // Log activity
    const activity = new Activity({
      user: req.user._id,
      type: 'file_upload',
      title: `Uploaded exam: ${req.file.originalname}`,
      resourceType: 'file',
      resourceId: file._id,
      metadata: {
        subject,
        grade,
        fileType: 'exam'
      }
    });
    
    await activity.save();
    
    res.status(201).json({
      message: 'Exam uploaded successfully',
      file
    });
  } catch (error) {
    console.error('Upload exam error:', error);
    res.status(500).json({ message: 'Server error uploading exam' });
  }
};

// Upload video
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { subject, grade } = req.body;
    
    // Create file record
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploader: req.user._id,
      type: 'video',
      subject,
      grade
    });
    
    await file.save();
    
    // Log activity
    const activity = new Activity({
      user: req.user._id,
      type: 'video_upload',
      title: `Uploaded video: ${req.file.originalname}`,
      resourceType: 'file',
      resourceId: file._id,
      metadata: {
        subject,
        grade,
        fileType: 'video'
      }
    });
    
    await activity.save();
    
    res.status(201).json({
      message: 'Video uploaded successfully',
      file
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ message: 'Server error uploading video' });
  }
};

// Upload recording
exports.uploadRecording = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { subject, grade } = req.body;
    
    // Create file record
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploader: req.user._id,
      type: 'recording',
      subject,
      grade
    });
    
    await file.save();
    
    // Log activity
    const activity = new Activity({
      user: req.user._id,
      type: 'recording',
      title: `Recorded audio: ${req.file.originalname}`,
      resourceType: 'file',
      resourceId: file._id,
      metadata: {
        subject,
        grade,
        fileType: 'recording'
      }
    });
    
    await activity.save();
    
    res.status(201).json({
      message: 'Recording uploaded successfully',
      file
    });
  } catch (error) {
    console.error('Upload recording error:', error);
    res.status(500).json({ message: 'Server error uploading recording' });
  }
};