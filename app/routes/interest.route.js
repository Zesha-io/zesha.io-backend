const router = require('express').Router();
const interest = require('../controllers/interest.controller');

router.get('/', interest.getInterests);

module.exports = router;