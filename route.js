var paypal = require('./controller/paypal');

module.exports = function(app) {
  app.post('/paypal/ipn', paypal.ipn);

  app.post('/', function(req, res) {
    res.json(req.body);
  });
  app.get('/', function(req, res) {
    res.send('hello, express.js');
  });
};
