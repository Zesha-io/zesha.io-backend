const router = require('express').Router();
const video = require('../controllers/video.controller');
const viewhistory = require('../controllers/viewhistory.controller');
const videoanalytics = require('../controllers/videoanalytics.controller');

router.post('/', video.createVideo);
router.get('/', video.getAllVideos);
router.get('/:id', video.getOneVideo);
router.post('/:id', video.updateVideo);
router.post('/:id/views', viewhistory.createVideoView);

router.get('/:id/analytics', videoanalytics.getVideoAnalytics);

module.exports = router;