const router = require('express').Router();
const video = require('../controllers/video.controller');
const viewhistory = require('../controllers/viewhistory.controller');
const analytics = require('../controllers/analytics.controller');

router.post('/', video.createVideo);
router.get('/', video.getAllVideos);
router.get('/:id', video.getOneVideo);
router.post('/:id', video.updateVideo);
router.post('/:id/views', viewhistory.createVideoView);

router.get('/:id/analytics', analytics.getVideoAnalytics);

module.exports = router;