const Activity = require('../models/Activity');

// Get user activities
exports.getUserActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };
    
    const activities = await Activity.paginate(filter, options);
    
    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error fetching activities' });
  }
};

// Create activity
exports.createActivity = async (req, res) => {
  try {
    const { type, title, description, resourceType, resourceId, metadata } = req.body;
    
    const activity = new Activity({
      user: req.user._id,
      type,
      title,
      description,
      resourceType,
      resourceId,
      metadata
    });
    
    await activity.save();
    
    res.status(201).json({
      message: 'Activity logged successfully',
      activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: 'Server error creating activity' });
  }
};