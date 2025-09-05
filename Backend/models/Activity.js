const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'content_save', 
      'file_upload', 
      'video_upload', 
      'recording', 
      'login', 
      'logout',
      'content_view',
      'assignment_submit'
    ]
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  resourceType: {
    type: String,
    enum: ['content', 'file', 'video', 'recording', 'none']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient querying
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Activity', activitySchema);