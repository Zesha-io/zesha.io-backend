const router = require('express').Router();
const user = require('../controllers/user.controller');
const video = require('../controllers/video.controller');
const analytics = require('../controllers/analytics.controller');

router.post('/', user.createUser);
router.get('/', user.getUser);
router.post('/:id', user.updateUserProfile);
router.get('/:id/videos', video.getCreatorVideos);

router.get('/:id/analytics', analytics.getCreatorAnalytics);

module.exports = router;