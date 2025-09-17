const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = [
  'uploads/textbooks',
  'uploads/exams',
  'uploads/videos',
  'uploads/recordings'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    switch (file.fieldname) {
      case 'textbook':
        uploadPath += 'textbooks/';
        break;
      case 'exam':
        uploadPath += 'exams/';
        break;
      case 'video':
        uploadPath += 'videos/';
        break;
      case 'recording':
        uploadPath += 'recordings/';
        break;
      default:
        uploadPath += 'other/';
    }
    
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept all file types but you can add restrictions here
  const allowedMimes = {
    textbook: [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    exam: [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    video: [
      'video/mp4', 
      'video/mpeg', 
      'video/quicktime', 
      'video/x-msvideo'
    ],
    recording: [
      'audio/webm', 
      'audio/mpeg', 
      'audio/wav'
    ]
  };

  const fieldAllowedMimes = allowedMimes[file.fieldname] || [];
  
  if (fieldAllowedMimes.length === 0 || fieldAllowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${fieldAllowedMimes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: fileFilter
});

// Middleware for different upload types
const uploadTextbook = upload.single('textbook');
const uploadExam = upload.single('exam');
const uploadVideo = upload.single('video');
const uploadRecording = upload.single('recording');

module.exports = {
  uploadTextbook,
  uploadExam,
  uploadVideo,
  uploadRecording
};