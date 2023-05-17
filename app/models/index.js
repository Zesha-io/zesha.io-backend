const mongoose = require('mongoose');
const dbConfig = require('../config/db.config');

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.users = require('./user.model')(mongoose);
db.creatorchannels = require('./creatorchannel.model')(mongoose);
db.userextensions = require('./userextension.model')(mongoose);
db.wallets = require('./wallet.model')(mongoose);
db.earnings = require('./earning.model')(mongoose);
db.payouts = require('./payout.model')(mongoose);
db.videos = require('./video.model')(mongoose);
db.tags = require('./tag.model')(mongoose);
db.likedislikehistories = require('./likedislikehistory.model')(mongoose);
db.viewhistories = require('./viewhistory.model')(mongoose);
db.interests = require('./interest.model')(mongoose);

module.exports = db;
