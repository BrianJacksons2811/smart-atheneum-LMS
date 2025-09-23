const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/activityController');

router.get('/', auth, ctrl.list);
router.post('/', auth, ctrl.add);

module.exports = router;
