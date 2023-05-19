const router = require('express').Router();
const earning = require('../controllers/earning.controller');

router.post('/', earning.createEarning);

module.exports = router;