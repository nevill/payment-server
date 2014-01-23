var paypal = require('./controller/paypal');
var payment = require('./controller/payment');

module.exports = function(app) {
  app.post('/paypal/ipn', paypal.ipn);

  app.post('/payments', payment.create);

  app.post('/', function(req, res) {
    res.json(req.body);
  });
  app.get('/', function(req, res) {
    res.send('hello, express.js');
  });
};
