const router = require('express').Router();
const user = require('../controllers/user.controller');
const video = require('../controllers/video.controller');

router.post('/', user.createUser);
router.get('/', user.getUser);
router.get('/:id', user.updateUserProfile);
router.get('/:id/videos', video.getCreatorVideos);

module.exports = router;