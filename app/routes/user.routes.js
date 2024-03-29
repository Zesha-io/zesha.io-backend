const router = require('express').Router();
const user = require('../controllers/user.controller');
const video = require('../controllers/video.controller');
const analytics = require('../controllers/analytics.controller');
const earning = require('../controllers/earning.controller');
const payout = require('../controllers/payout.controller');

router.post('/', user.createUser);
router.get('/', user.getUser);
router.post('/:id', user.updateUserProfile);
router.get('/:id/videos', video.getCreatorVideos);
router.get('/:id/analytics', analytics.getUserAnalytics);
router.get('/:id/earnings', earning.getEarningHistory);
router.get('/:id/payouts', payout.getPayoutHistory);

module.exports = router;