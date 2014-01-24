var should = require('should');

var db = require('../database');
var Payment = db.models.Payment;

before(function(done) {
  db.init(done);
});

describe('Payment Class', function() {
  before(function(done) {
    db.loadFixtures(done);
  });

  describe('Method - findDues', function() {
    it('should list all the payments will be executed', function(done) {
      Payment.findDues(function(err, payments) {
        should.not.exist(err);
        payments.length.should.above(0);
        done();
      });
    });
  });
});

describe('Payment Instance', function() {

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

    it('should NOT have attribute `nextBilling`', function(done) {
      this.payment.save(function(err, payment) {
        should.not.exist(err);
        should.not.exist(payment.nextBilling);
        done();
      });
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
        period: 'DAILY',
        callbackUrl: 'https://localhost/paypal?id=someRandomId28472329'
      });
    });

    it('should have attribute `nextBilling`', function(done) {
      this.payment.save(function(err, payment) {
        should.exist(payment.nextBilling);
        payment.nextBilling.should.eql(
          new Date(payment.startingAt.valueOf() + 1000 * 86400));
        done();
      });
    });

    describe('When execute a payment', function() {
      var amount = 2.93;
      before(function(done) {
        this.invoice = {
          payKey: 'AP-TestingPayKey',
          amount: amount,
          receivers: ['cause@example.com']
        };
        this.billingDay = this.payment.nextBilling;
        this.payment.execute(this.invoice, done);
      });

      it('should set attribute `lastBilling`', function() {
        var lastBilling = this.payment.lastBilling;
        should.exist(lastBilling);
        lastBilling.should.within(this.billingDay, new Date());
        this.payment.nextBilling.should.within(
          lastBilling.valueOf(), lastBilling.valueOf() + 1000 * 86400);
        this.payment.accruedAmount.should.eql(amount);
        this.payment.history.should.have.length(1);
      });
    });
  });
});
