const mongoose = require('mongoose');
const dbConfig = require('../config/db.config');

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.user = require('./user.model')(mongoose);
db.creatorchannel = require('./creatorchannel.model')(mongoose);
db.userextension = require('./userextension.model')(mongoose);
db.wallet = require('./wallet.model')(mongoose);
db.earning = require('./earning.model')(mongoose);
db.payout = require('./payout.model')(mongoose);
db.video = require('./video.model')(mongoose);
db.tag = require('./tag.model')(mongoose);
db.likedislikehistory = require('./likedislikehistory.model')(mongoose);
db.viewhistory = require('./viewhistory.model')(mongoose);
db.interest = require('./interest.model')(mongoose);

module.exports = db;
