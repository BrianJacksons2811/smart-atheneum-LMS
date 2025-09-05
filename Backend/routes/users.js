const express = require('express');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// Update user
router.put('/:id', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const { firstName, lastName, grade, subject } = req.body;
    
    // Users can only update their own profile unless they're admin
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, grade, subject },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

module.exports = router;
userSchema.plugin(mongoosePaginate);