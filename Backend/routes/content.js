const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/contentController');

router.get('/', auth, ctrl.list);
router.post('/', auth, ctrl.create);

module.exports = router;
