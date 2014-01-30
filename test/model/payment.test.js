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
        receivers: ['mike@example.com'],
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

    it('should componse a pay request package', function() {
      var data = this.payment.composePayRequestData();

      should.exist(data.ipnNotificationUrl);
      data.ipnNotificationUrl.should.include(this.payment.id);

      data.receiverList.receiver.should.have.length(1);
      var receiver = data.receiverList.receiver[0];
      receiver.email.should.eql('mike@example.com');
      receiver.amount.should.eql(9.99);

      data.actionType.should.eql('CREATE');
      data.senderEmail.should.eql('guest@example.com');

      data.memo.should.be.type('string');
      data.memo.indexOf(9.99).should.not.eql(-1);
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
        receivers: ['someone@example.com'],
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

    it('should componse a pay request package', function() {
      var data = this.payment.composePayRequestData();
      data.receiverList.receiver.should.have.length(1);
      var receiver = data.receiverList.receiver[0];
      receiver.email.should.eql('someone@example.com');
      receiver.amount.should.eql(1.99);
      data.senderEmail.should.eql('guest@example.com');
      data.actionType.should.eql('PAY');
      data.memo.should.be.type('string');
      should(data.memo.indexOf(1.99)).not.eql(-1);
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
