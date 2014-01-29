var qs = require('qs');
var sinon = require('sinon');
var should = require('should');
var request = require('supertest');

var app = require('./common').app;
var paypalClient = app.get('paypalClient');

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
  before(function() {
    this.stub = sinon.stub(paypalClient, '_httpsRequest');
    this.stub.callsArgWith(2, null, {
      body: JSON.stringify({
        payKey: 'AP-Some3274Random93750Key183'
      })
    });
  });

  after(function() {
    this.stub.restore();
  });

  it('should response with a paypal page link', function(done) {
    var params = {
      receiverList: {
        receiver: [{
          email: 'buyer@example.com',
          amount: 19.98
        }]
      },
      actionType: 'CREATE',
      returnUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
      ipnNotificationUrl: 'https://example.com/ipn',
      memo: 'Give $19.98 away to the buyer',
    };

    request(app)
      .post('/paypal/pay')
      .set('Content-Type', 'application/json')
      .send(params)
      .expect(200)
      .end(function(err, res) {
        var body = res.body;
        should.exist(body.link);
        should.exist(body.payKey);
        body.link
          .should.match(/sandbox.+cmd=_ap-payment.+paykey=AP-\w+/);
        done();
      });
  });
});

describe('POST /paypal/preapproval', function() {
  before(function() {
    this.stub = sinon.stub(paypalClient, '_httpsRequest');
    this.stub.callsArgWith(2, null, {
      body: JSON.stringify({
        preapprovalKey: 'PA-Some294Random5917501Key043'
      })
    });
  });

  after(function() {
    this.stub.restore();
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
      ipnNotificationUrl: 'https://example.com/ipn',
      memo: 'Subscribe to the Monthly Show',
    };

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
        done();
      });
  });
});
