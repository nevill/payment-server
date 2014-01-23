var should = require('should');

var db = require('../database');
var Payment = db.models.Payment;

var paymentAttrs = {
  kind: 'RECURRING',
  key: 'Some Random Preapproval Key',
  startingAt: new Date(2013, 11, 31),
  endingAt: new Date(2014, 11, 31),
  senderEmail: 'guest@example.com',
  amount: 1.99,
  accruedAmount: 0.00,
  period: 'DAILY',
  callbackUrl: 'https://localhost/paypal?id=someRandomId28472329'
};

before(function(done) {
  db.init(done);
});

describe('Payment Model', function() {
  var payment = new Payment(paymentAttrs);

  it('should store to database successfully', function(done) {
    payment.save(function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should have attribute `nextBilling`', function() {
    should.exist(payment.nextBilling);
    payment.nextBilling.should.eql(
      new Date(payment.startingAt.valueOf() + 1000 * 3600 * 24));
  });
});
