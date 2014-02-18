var should = require('should');

var db = require('../database');
var Payment = db.models.Payment;

before(function(done) {
  db.init(done);
});

var checkBilling = function() {
  it('should have `nextBilling` if status is `ACTIVE`', function() {
    var payment = this.payment;
    if (payment.status === 'ACTIVE') {
      should.exist(payment.nextBilling);
    } else {
      should.not.exist(payment.nextBilling);
    }
  });

  it('should have `lastBilling` if status is `COMPLETED`', function() {
    if (this.payment.status === 'COMPLETED') {
      should.exist(this.payment.lastBilling);
    }
  });
};

describe('Model Payment', function() {
  before(function(done) {
    db.loadFixtures(done);
  });

  after(function(done) {
    db.unloadFixtures(done);
  });

  describe('Class methods', function() {
    describe('Method - findDues', function() {
      it('should list all the payments will be executed', function(done) {
        Payment.findDues(function(err, payments) {
          should.not.exist(err);
          payments.length.should.above(0);
          done();
        });
      });
    });

    describe('Method - createSingle', function() {
      it('should create a single payment', function(done) {
        var attrs = {
          receivers: 'somone@example.com',
          amount: '10.97',
          callbackUrl: 'http://localhost:3000/api/donations/randomId9527',
        };
        Payment.createSingle(attrs, function(err, payment) {
          payment.kind.should.eql('SINGLE');
          done(err);
        });
      });
    });

    describe('Method - createRecurring', function() {
      it('should create a recurring payment', function(done) {
        var attrs = {
          key: 'some3mv237RandomPreapproval26x0f6o571Key',
          startingAt: new Date(2013, 11, 31),
          endingAt: new Date(2014, 11, 31),
          amount: '16.59',
          period: 'MONTHLY',
          receivers: 'somone@example.com',
          callbackUrl: 'http://localhost:3000/api/donations/randomId9527',
        };
        Payment.createRecurring(attrs, function(err, payment) {
          payment.kind.should.eql('RECURRING');
          done(err);
        });
      });
    });

    describe('Method - executeSingle', function() {
      before(function() {
        // from test/fixture/index.js
        this.paymentId = '52fa10d7aa3c92020081885b';
        this.data = {
          senderEmail: 'someone@example.com',
          status: 'COMPLETED'
        };
      });

      it('should update payment', function(done) {
        var self = this;
        Payment.executeSingle(this.paymentId, this.data,
          function(err, payment, numberAffercted) {
            should.not.exist(err);
            numberAffercted.should.above(0);
            payment.kind.should.eql('SINGLE');
            payment.senderEmail.should.eql(self.data.senderEmail);
            payment.status.should.eql(self.data.status);
            done();
          });
      });
    });

    describe('Method - authorize', function() {
      before(function() {
        // from test/fixture/index.js
        this.paymentId = '52f8c1bee6249c0000000001';
        this.data = {
          senderEmail: 'someone@example.com',
          status: 'ACTIVE'
        };
      });

      it('should update payment', function(done) {
        var self = this;
        Payment.authorize(this.paymentId, this.data,
          function(err, payment, numberAffercted) {
            should.not.exist(err);
            numberAffercted.should.above(0);
            payment.kind.should.eql('RECURRING');
            payment.senderEmail.should.eql(self.data.senderEmail);

            payment.status.should.eql('ACTIVE');
            should.exist(payment.nextBilling);
            payment.nextBilling.should.within(
              payment.startingAt.valueOf(),
              payment.startingAt.valueOf() + 1000 * 86400);

            done();
          });
      });
    });
  });

  describe('Instance methods', function() {

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

      it('should compose a pay request package', function() {
        var data = this.payment.composePayRequest();

        should.exist(data.ipnNotificationUrl);
        data.ipnNotificationUrl.should.include(this.payment.id);
        data.ipnNotificationUrl.should.include('action=pay');

        data.receiverList.receiver.should.have.length(1);
        var receiver = data.receiverList.receiver[0];
        receiver.email.should.eql('mike@example.com');
        receiver.amount.should.eql(9.99);

        data.actionType.should.eql('CREATE');
        data.senderEmail.should.eql('guest@example.com');

        data.memo.should.be.type('string');
        data.memo.indexOf(9.99).should.not.eql(-1);
      });

      describe('Validation', function() {
        it('should fail without required attributes', function(done) {
          this.payment.kind = '';
          this.payment.status = '';
          this.payment.callbackUrl = '';

          this.payment.validate(function(err) {
            should.exist(err.errors.kind);
            should.exist(err.errors.status);
            should.exist(err.errors.callbackUrl);
            done();
          });
        });
      });
    });

    describe('type - Recurring', function() {
      before(function(done) {
        var self = this;
        this.paymentId = '53032e6efcc7cca72fecb3c3';
        Payment.findById(this.paymentId, function(err, payment) {
          self.payment = payment;
          done(err);
        });
      });

      it('should compose a pay request package', function() {
        var data = this.payment.composePayRequest();
        data.receiverList.receiver.should.have.length(1);

        should.exist(data.ipnNotificationUrl);
        data.ipnNotificationUrl.should.include(this.payment.id);
        data.ipnNotificationUrl.should.include('action=execute');

        var receiver = data.receiverList.receiver[0];
        receiver.email.should.eql('someone@example.com');
        receiver.amount.should.eql(1.99);

        data.senderEmail.should.eql('guest@example.com');
        data.actionType.should.eql('PAY');
        data.memo.should.be.type('string');

        should(data.memo.indexOf(1.99)).not.eql(-1);
      });

      it('should compose a preapproval request package', function() {
        var data = this.payment.composePreapprovalRequest({
          returnUrl: '',
          cancelUrl: '',
        });

        data.startingDate.should.eql(this.payment.startingAt);
        data.endingDate.should.eql(this.payment.endingAt);
        data.period.should.eql(this.payment.period);
        data.maxAmountPerPayment.should.eql(this.payment.amount);
        data.maxTotalAmountOfAllPayments
          .should.eql(this.payment._calculateTotalAmount());
        data.ipnNotificationUrl.indexOf(this.payment.id).should.above(-1);
        should.exist(data.returnUrl);
        should.exist(data.cancelUrl);
      });

      it('should return total amount of all the payments', function() {
        this.payment._calculateTotalAmount().should.eql(23.88);
      });

      checkBilling();

      describe('When execute a payment', function() {
        before(function(done) {
          var self = this;
          Payment.authorize(this.payment.id, {
            senderEmail: 'someone@example.com',
            status: 'ACTIVE'
          }, function(err, payment) {
            self.payment = payment;
            done(err);
          });
        });

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

        checkBilling();

        it('should set attribute `lastBilling`', function() {
          var lastBilling = this.payment.lastBilling;
          should.exist(lastBilling);

          lastBilling.should.within(this.billingDay, new Date());
          this.payment.nextBilling.should.within(
            lastBilling.valueOf(), lastBilling.valueOf() + 31000 * 86400);

          this.payment.accruedAmount.should.eql(amount);
          this.payment.history.should.have.length(1);
        });
      });
    });
  });
});
