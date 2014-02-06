var qs = require('qs');
var sinon = require('sinon');
var should = require('should');
var request = require('supertest');

var common = require('./common');
var app = common.app;
var db = common.db;
var model = db.models;

var paypalClient = app.get('paypalClient');

before(function(done) {
  db.init(done);
});

describe('POST /paypal/ipn', function() {
  before(function() {
    this.stub = sinon.stub(paypalClient, '_httpsRequest');
    this.stub.callsArgWith(2, null, {
      body: 'VALID'
    });

    this.spy = sinon.spy(paypalClient, 'verify');
  });

  after(function() {
    this.stub.restore();
    this.spy.restore();
  });

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

describe('POST /paypal/pay', function() {
  before(function(done) {
    this.mock = sinon.mock(paypalClient);
    this.expect = this.mock.expects('_httpsRequest');
    this.expect.callsArgWith(2, null, {
      body: JSON.stringify({
        payKey: 'AP-Some3274Random93750Key183'
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
        should.exist(body.payKey);
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
          done();
        });
      });
  });
});

describe('POST /paypal/preapproval', function() {
  before(function(done) {
    this.mock = sinon.mock(paypalClient);
    this.expect = this.mock.expects('_httpsRequest');
    this.expect.callsArgWith(2, null, {
      body: JSON.stringify({
        preapprovalKey: 'PA-Some294Random5917501Key043'
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
      maxAmountPerPayment: 9.99,
      maxTotalAmountOfAllPayments: 1000,
      startingDate: new Date('2013-12-31'),
      endingDate: new Date('2014-12-31'),
      returnUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    };

    var expect = this.expect;
    var numOfPayments = this.numOfPayments;
    request(app)
      .post('/paypal/preapproval')
      .set('Content-Type', 'application/json')
      .send(params)
      .expect(200)
      .end(function(err, res) {
        var body = res.body;
        should.exist(body.link);
        should.exist(body.preapprovalKey);
        body.link.should
          .match(/sandbox.+cmd=_ap-preapproval.+preapprovalkey=PA-\w+/);

        expect.calledWithMatch(function(value) {
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
          done();
        });
      });
  });
});
