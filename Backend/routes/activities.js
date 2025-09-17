const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const activityCtl = require('../controllers/activityController');
router.get('/', auth, activityCtl.getUserActivities);
router.post('/', auth, activityCtl.createActivity);
module.exports = router;