const router = require('express').Router();
const user = require('../controllers/user.controller');
const video = require('../controllers/video.controller');
const videoanalytics = require('../controllers/videoanalytics.controller');

router.post('/', user.createUser);
router.get('/', user.getUser);
router.get('/:id', user.updateUserProfile);
router.get('/:id/videos', video.getCreatorVideos);

router.post('/:id/analytics', videoanalytics.getCreatorAnalytics);

module.exports = router;