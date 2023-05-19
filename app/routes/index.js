const userRoutes = require('./user.routes');
const videoRoutes = require('./video.routes');
const earningRoutes = require('./earning.routes');
const interestRoutes = require('./interest.route');

module.exports = (app) => {
  app.get('/api', (req, res) => {
    res.status(403).json({ success: false, data: 'Invalid route' });
  });

  app.use('/api/users', userRoutes);
  app.use('/api/videos', videoRoutes);
  app.use('/api/earnings', earningRoutes);
  app.use('/api/interests', interestRoutes);
};
