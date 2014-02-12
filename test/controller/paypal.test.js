var qs = require('qs');
var should = require('should');
var sinon = require('sinon');
var request = require('supertest');

var common = require('./common');
var app = common.app;
var db = common.db;
var model = db.models;
var constant = model.constants;

var paypalClient = app.get('paypalClient');

before(function(done) {
  db.init(done);
});

describe('POST /paypal/ipn', function() {
  before(function(done) {
    db.loadFixtures(done);
  });

  after(function(done) {
    db.unloadFixtures(done);
  });

  before(function() {
    this.stub = sinon.stub(paypalClient, '_httpsRequest');
    this.stub.callsArgWith(2, null, {
      body: 'VERIFIED'
    });

    this.spy = sinon.spy(paypalClient, 'verify');
  });

  after(function() {
    this.stub.restore();
    this.spy.restore();
  });

  describe('Generic', function() {
    it('should response with status 200', function(done) {
      var params = {
        name: 'Dylan Thomas',
        memo: 'Do not go gentle into that good night',
        amount: 8.51,
        users: [{
          name: 'Joe',
          email: 'joe@example.com'
        }, {
          name: 'William',
          email: 'bill@example.com'
        }],
        timestamp: '2014-01-20T10:37:40.531Z'
      };
      var spy = this.spy;
      request(app)
        .post('/paypal/ipn')
        .send(qs.stringify(params))
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect(200)
        .end(function() {
          spy.calledWithMatch(function(value) {
            return value.should.have.properties({
              name: params.name,
              memo: params.memo,
              amount: params.amount.toString(),
              timestamp: params.timestamp,
              'users[0][email]': 'joe@example.com',
              'users[1][name]': 'William'
            });
          }, sinon.match.func).should.eql(true);
          done();
        });
    });
  });

  describe('Verfiy preapproval', function() {
    before(function() {
      this.paymentId = '52f8c1bee6249c0000000001';
      this.senderEmail = 'someone@example.com';
      this.requestParams = {
        'max_number_of_payments': '30',
        'starting_date': '2014-01-21T00:00:00.000Z',
        'pin_type': 'NOT_REQUIRED',
        'max_amount_per_payment': '1.05',
        'currency_code': 'USD',
        'sender_email': this.senderEmail,
        'verify_sign': 'AWRhzfmPo8xXIaEBzCxibaq2oZ.Fxh9dwQ6mT8',
        'test_ipn': '1',
        'date_of_month': '0',
        'current_number_of_payments': '0',
        'preapproval_key': 'PA-SomeRandomKey859kmdf782.781p4u',
        'ending_date': '2014-02-21T00:00:00.000Z',
        'approved': 'true',
        'transaction_type': 'Adaptive Payment PREAPPROVAL',
        'day_of_week': 'NO_DAY_SPECIFIED',
        'status': 'ACTIVE',
        'current_total_amount_of_all_payments': '0.00',
        'current_period_attempts': '0',
        'charset': 'windows-1252',
        'payment_period': '0',
        'notify_version': 'UNVERSIONED',
        'max_total_amount_of_all_payments': '10.00'
      };
    });

    it('should update the payment model', function(done) {
      var self = this;
      var Payment = model.Payment;
      request(app)
        .post('/paypal/ipn?' + qs.stringify({
          id: this.paymentId,
          action: 'preapproval'
        }))
        .send(qs.stringify(this.requestParams))
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect(200)
        .end(function() {
          Payment.findById(self.paymentId, function(err, payment) {
            payment.senderEmail.should.eql(self.senderEmail);
            payment.status.should.eql(constant.PAYMENT_STATUS.ACTIVE);
            done(err);
          });
        });
    });
  });

  describe('Verify single pay', function() {
    before(function() {
      this.paymentId = '52fa10d7aa3c92020081885b';
      this.senderEmail = 'sender@example.com';
      //jshint camelcase: false
      this.requestParams = {
        payment_request_date: 'Tue Feb 11 04:00:24 PST 2014',
        return_url: 'http://localhost/paypal/success',
        fees_payer: 'EACHRECEIVER',
        ipn_notification_url: 'http://localhost/paypal/ipn?id=52fa10d7',
        sender_email: this.senderEmail,
        verify_sign: 'An5ns1Kso7MWUdW4ErQKJJJ4qi4',
        test_ipn: '1',
        'transaction[0].id_for_sender_txn': '41G20083518704320',
        'transaction[0].receiver': 'merchant@example.com',
        cancel_url: 'http://localhost/paypal/cancel',
        'transaction[0].is_primary_receiver': 'false',
        pay_key: 'AP-9JW99057EE970045D',
        action_type: 'CREATE',
        'transaction[0].id': '5NX214736D529512R',
        memo: 'Pay 0.99 via Paypal.com',
        'transaction[0].status': 'Completed',
        'transaction[0].paymentType': 'SERVICE',
        'transaction[0].status_for_sender_txn': 'Completed',
        'transaction[0].pending_reason': 'NONE',
        transaction_type: 'Adaptive Payment PAY',
        'transaction[0].amount': 'USD 0.99',
        status: 'COMPLETED',
        log_default_shipping_address_in_transaction: 'false',
        charset: 'windows-1252',
        notify_version: 'UNVERSIONED',
        reverse_all_parallel_payments_on_error: 'false'
      };
    });
    it('should update the payment model', function(done) {
      var self = this;
      var Payment = model.Payment;

      request(app)
        .post('/paypal/ipn?' + qs.stringify({
          id: this.paymentId,
          action: 'pay'
        }))
        .send(qs.stringify(this.requestParams))
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect(200)
        .end(function() {
          Payment.findById(self.paymentId, function(err, payment) {
            payment.senderEmail.should.eql(self.senderEmail);
            payment.status.should.eql(constant.PAYMENT_STATUS.COMPLETED);
            done(err);
          });
        });
    });
  });
});

describe('POST /paypal/pay', function() {
  before(function(done) {
    this.payKey = 'AP-Some3274Random93750Key183';
    this.mock = sinon.mock(paypalClient);
    this.expect = this.mock.expects('_httpsRequest');
    this.expect.callsArgWith(2, null, {
      body: JSON.stringify({
        payKey: this.payKey
      })
    });

    var self = this;
    model.Payment.count(function(err, total) {
      self.numOfPayments = total;
      done();
    });
  });

  after(function() {
    this.mock.restore();
  });

  it('should response with a paypal page link', function(done) {
    var params = {
      receivers: ['buyer@example.com'],
      amount: 19.98,
      returnUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      callbackUrl: 'https://example.com/entity/randomId9527'
    };
    var payKey = this.payKey;
    var expect = this.expect;
    var numOfPayments = this.numOfPayments;

    request(app)
      .post('/paypal/pay')
      .set('Content-Type', 'application/json')
      .send(params)
      .expect(200)
      .end(function(err, res) {
        should.not.exist(err);
        var body = res.body;
        should.not.exist(body.error);
        should.exist(body.link);
        body.payKey.should.eql(payKey);
        body.link
          .should.match(/sandbox.+cmd=_ap-payment.+paykey=AP-\w+/);

        expect.calledWithMatch(function(value) {
          should.exist(value.receiverList.receiver);
          value.receiverList.receiver.length.should.above(0);

          value.should.have.properties('currencyCode', 'memo',
            'requestEnvelope', 'actionType',
            'returnUrl', 'cancelUrl');
          return true;
        }, function(value) {
          value.path.should.eql('/AdaptivePayments/Pay');
          return true;
        }, sinon.match.func).should.eql(true);

        model.Payment.count(function(err, num) {
          num.should.eql(numOfPayments + 1);
          model.Payment.findOne({
            key: payKey
          }, function(err, payment) {
            should.exist(payment.id);
            done(err);
          });
        });
      });
  });
});

describe('POST /paypal/preapproval', function() {
  before(function(done) {
    this.preapprovalKey = 'PA-Some294Random5917501Key043';
    this.mock = sinon.mock(paypalClient);
    this.expect = this.mock.expects('_httpsRequest');
    this.expect.callsArgWith(2, null, {
      body: JSON.stringify({
        preapprovalKey: this.preapprovalKey
      })
    });

    var self = this;
    model.Payment.count(function(err, total) {
      self.numOfPayments = total;
      done();
    });
  });

  after(function() {
    this.mock.restore();
  });

  it('should response with a paypal page link', function(done) {
    var params = {
      period: 'MONTHLY',
      amount: 9.99,
      receivers: 'someone@example.com',
      startingAt: new Date(2013, 11, 31),
      endingAt: new Date(2014, 11, 31),
      returnUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      callbackUrl: 'https://example.com/entities/entityId',
    };
    var preapprovalKey = this.preapprovalKey;
    var expect = this.expect;
    var numOfPayments = this.numOfPayments;

    request(app)
      .post('/paypal/preapproval')
      .set('Content-Type', 'application/json')
      .send(params)
      .expect(200)
      .end(function(err, res) {
        should.not.exist(err);
        var body = res.body;
        should.not.exist(body.error);
        should.exist(body.link);
        body.preapprovalKey.should.eql(preapprovalKey);
        body.link.should
          .match(/sandbox.+cmd=_ap-preapproval.+preapprovalkey=PA-\w+/);

        expect.calledWithMatch(function(value) {
          value.maxTotalAmountOfAllPayments.should.eql(119.88);
          value.should.have.properties('currencyCode',
            'requestEnvelope',
            'startingDate', 'endingDate', 'maxTotalAmountOfAllPayments',
            'returnUrl', 'cancelUrl', 'ipnNotificationUrl');
          return true;
        }, function(value) {
          value.path.should.eql('/AdaptivePayments/Preapproval');
          return true;
        }, sinon.match.func).should.eql(true);

        model.Payment.count(function(err, num) {
          num.should.eql(numOfPayments + 1);
          model.Payment.findOne({
            key: preapprovalKey
          }, function(err, payment) {
            should.exist(payment.id);
            done(err);
          });
        });
      });
  });
});
