var should = require('should');

var db = require('../database');
var Payment = db.models.Payment;

before(function(done) {
  db.init(done);
});

var shouldStoreToDb = function() {
  it('should store to database successfully', function(done) {
    this.payment.save(function(err) {
      should.not.exist(err);
      done();
    });
  });
};

describe('Payment Model', function() {

  describe('type - Single', function() {
    before(function() {
      this.payment = new Payment({
        kind: 'SINGLE',
        key: 'A Random Pay Key',
        senderEmail: 'guest@example.com',
        amount: 9.99,
        status: 'COMPLETED',
        callbackUrl: 'https://localhost/paypal?id=someRandomId9471645'
      });
    });

    shouldStoreToDb();

    it('should NOT have attribute `nextBilling`', function() {
      should.not.exist(this.payment.nextBilling);
    });
  });

  describe('type - Recurring', function() {
    before(function() {
      this.payment = new Payment({
        kind: 'RECURRING',
        key: 'A Random Preapproval Key',
        startingAt: new Date(2013, 11, 31),
        endingAt: new Date(2014, 11, 31),
        senderEmail: 'guest@example.com',
        amount: 1.99,
        accruedAmount: 0.00,
        period: 'DAILY',
        callbackUrl: 'https://localhost/paypal?id=someRandomId28472329'
      });
    });
    shouldStoreToDb();

    it('should have attribute `nextBilling`', function() {
      should.exist(this.payment.nextBilling);
      this.payment.nextBilling.should.eql(
        new Date(this.payment.startingAt.valueOf() + 1000 * 3600 * 24));
    });
  });
});
