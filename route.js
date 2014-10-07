var PaymentController = require('./controller/payment');
var PaypalController = require('./controller/paypal');

function bindTo(controller, context) {
  Object.keys(controller).forEach(function(method) {
    var func = controller[method];
    if (typeof func === 'function') {
      controller[method] = func.bind(context);
    }
  });
  return controller;
}

module.exports = function(app, context) {
  bindTo(PaymentController, context);
  bindTo(PaypalController, context);

  app.post('/paypal/ipn', PaypalController.ipn);
  app.post('/paypal/preapproval', PaypalController.preapproval);
  app.post('/paypal/pay', PaypalController.pay);

  app.post('/payments', PaymentController.create);

  app.post('/', function(req, res) {
    res.json(req.body);
  });
  app.get('/', function(req, res) {
    res.send('Hello from your Payment server!');
  });
};
