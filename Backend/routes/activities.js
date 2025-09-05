const express = require('express');
const {
  getUserActivities,
  createActivity
} = require('../controllers/activityController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Routes
router.get('/', auth, getUserActivities);
router.post('/', auth, createActivity);

module.exports = router;