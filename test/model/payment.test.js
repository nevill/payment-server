var should = require('should');

var db = require('../database');
var Payment = db.models.Payment;

var paymentAttrs = {
  kind: 'RECURRING',
  key: 'Some Random Preapproval Key',
  startingAt: new Date(2013, 11, 31),
  endingAt: new Date(2014, 11, 31),
  senderEmail: 'guest@example.com',
  nextBilling: new Date(2014, 0, 31),
  amount: 1.99,
  accruedAmount: 0.00,
  callbackUrl: 'https://localhost/paypal?id=someRandomId28472329'
};

before(function(done) {
  db.init(done);
});

describe('Payment Model', function() {
  it('should store to database successfully', function(done) {
    var payment = new Payment(paymentAttrs);
    payment.save(function(err) {
      should.not.exist(err);
      done();
    });
  });
});
