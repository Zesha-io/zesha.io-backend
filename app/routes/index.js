module.exports = (app) => {
  app.get('/api', (req, res) => {
    res.status(403).json({ success: false, data: 'Invalid route' });
  });
};
