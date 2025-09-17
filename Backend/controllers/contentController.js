const Content = require('../models/Content');
const File = require('../models/File');
const Activity = require('../models/Activity');
const  validationResult = require('express-validator');

// Create new content
exports.createContent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { title, topic, description, subject, grade, tags } = req.body;

    const content = new Content({
      title,
      topic,
      description,
      subject,
      grade,
      tags: tags || [],
      createdBy: req.user._id
    });

    await content.save();

    // Log activity
    const activity = new Activity({
      user: req.user._id,
      type: 'content_save',
      title: `Created content: ${title}`,
      description: topic || 'No topic specified',
      resourceType: 'content',
      resourceId: content._id,
      metadata: {
        subject,
        grade
      }
    });

    await activity.save();

    res.status(201).json({
      message: 'Content created successfully',
      content
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Server error creating content' });
  }
};

// Get all content with filtering
exports.getContent = async (req, res) => {
  try {
    const { subject, grade, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;
    
    // If user is a teacher, only show their content
    if (req.user.role === 'teacher') {
      filter.createdBy = req.user._id;
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'createdBy', select: 'firstName lastName' },
        { path: 'files', select: 'filename originalName mimetype size' },
        { path: 'recordings', select: 'filename originalName mimetype size' }
      ]
    };
    
    const content = await Content.paginate(filter, options);
    
    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error fetching content' });
  }
};

// Get single content item
exports.getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('files', 'filename originalName mimetype size path')
      .populate('recordings', 'filename originalName mimetype size path');
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ message: 'Server error fetching content' });
  }
};

// Update content
exports.updateContent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { title, topic, description, tags } = req.body;
    
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user owns this content or is admin
    if (content.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this content' });
    }
    
    content.title = title || content.title;
    content.topic = topic || content.topic;
    content.description = description || content.description;
    content.tags = tags || content.tags;
    
    await content.save();
    
    res.json({
      message: 'Content updated successfully',
      content
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error updating content' });
  }
};

// Delete content
exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user owns this content or is admin
    if (content.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this content' });
    }
    
    await Content.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error deleting content' });
  }
};

// Add file to content
exports.addFileToContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user owns this content or is admin
    if (content.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this content' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Create file record
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploader: req.user._id,
      type: req.file.fieldname,
      subject: content.subject,
      grade: content.grade
    });
    
    await file.save();
    
    // Add file to content
    content.files.push(file._id);
    await content.save();
    
    // Log activity
    const activity = new Activity({
      user: req.user._id,
      type: 'file_upload',
      title: `Uploaded ${req.file.fieldname}: ${req.file.originalname}`,
      resourceType: 'file',
      resourceId: file._id,
      metadata: {
        subject: content.subject,
        grade: content.grade,
        fileType: req.file.fieldname
      }
    });
    
    await activity.save();
    
    res.status(201).json({
      message: 'File added to content successfully',
      file
    });
  } catch (error) {
    console.error('Add file to content error:', error);
    res.status(500).json({ message: 'Server error adding file to content' });
  }
};