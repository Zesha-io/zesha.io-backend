const router = require('express').Router();
const payout = require('../controllers/payout.controller');

router.post('/', payout.createPayout);

module.exports = router;