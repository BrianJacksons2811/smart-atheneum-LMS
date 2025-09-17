const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    enum: [
      'Mathematics', 
      'Mathematical Literacy', 
      'Accounting', 
      'Physical Sciences',
      'Tourism', 
      'Agriculture', 
      'Geography', 
      'Life Sciences',
      'History'
    ]
  },
  grade: {
    type: String,
    required: true,
    enum: ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  recordings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
contentSchema.index({ subject: 1, grade: 1 });
contentSchema.index({ createdBy: 1 });
contentSchema.index({ tags: 1 });

contentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Content', contentSchema);