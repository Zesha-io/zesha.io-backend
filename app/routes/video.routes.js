const router = require('express').Router();
const video = require('../controllers/video.controller');

router.post('/', video.createVideo);
router.get('/', video.getAllVideos);
router.get('/:id', video.getOneVideo);
router.post('/:id', video.updateVideo);

module.exports = router;