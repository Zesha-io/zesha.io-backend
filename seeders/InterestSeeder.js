/* eslint-disable no-await-in-loop */
const db = require('../app/models');

const Interest = db.interests;
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to the database!');
  })
  .catch((err) => {
    console.log('Cannot connect to the database!', err);
    process.exit();
  });

const seedInterests = [
  {
    name: 'Beauty',
  },
  {
    name: 'Travel',
    icon: '',
  },
  {
    name: 'Languages',
    icon: '',
  },
  {
    name: 'Food',
    icon: '',
  },
  {
    name: 'Culture',
    icon: '',
  },
  {
    name: 'Cars',
    icon: '',
  },
  {
    name: 'Politics',
    icon: '',
  },
];

const seedDB = async () => {
    /* delete all interests */
    await Interest.deleteMany({});
    /* add the interests */
    await Interest.insertMany(seedInterests);
};
  
seedDB().then(() => {
    db.mongoose.connection.close();
});  