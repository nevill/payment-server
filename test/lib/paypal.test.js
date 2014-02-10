var nock = require('nock');
var sinon = require('sinon');
var should = require('should');

var app = require('../../');
var paypalClient = app.get('paypalClient');

describe('Paypal#pay', function() {
  before(function() {
    this.mock = sinon.mock(paypalClient);
    this.expect = this.mock.expects('_httpsRequest');
    this.expect.callsArgWith(2, null, {
      body: JSON.stringify({
        responseEnvelope: {
          timestamp: '2014-01-28T20:00:45.904-08:00',
          ack: 'Success',
          correlationId: '75e6e18692a9d',
          build: '7935900'
        },
        payKey: 'AP-9XD53792X68573649',
        paymentExecStatus: 'CREATED'
      })
    });
  });

  after(function() {
    this.mock.restore();
  });

  it('should return a paykey', function(done) {
    var expect = this.expect;
    var options = {
      receiverList: {
        receiver: [{
          email: 'someone@example.com',
          amount: 0.97
        }]
      },
      actionType: 'CREATE',
      returnUrl: 'http://localhost:3000/paypal/success',
      cancelUrl: 'http://localhost:3000/paypal/cancel',
      ipnNotificationUrl: 'http://localhost:3000/paypal/ipn',
    };
    paypalClient.pay(options, function(err, body) {
      should.not.exist(err);
      should.exist(body.payKey);

      expect.calledWithMatch(function(value) {
        value.should.have.properties('currencyCode', 'requestEnvelope',
          'actionType', 'receiverList', 'returnUrl', 'cancelUrl');
        return true;
      }, function(value) {
        value.path.should.eql('/AdaptivePayments/Pay');
        return true;
      }, sinon.match.func).should.eql(true);

      done();
    });
  });
});

describe('Paypal#preapproval', function() {
  before(function() {
    this.mock = sinon.mock(paypalClient);
    this.expect = this.mock.expects('_httpsRequest');
    this.expect.callsArgWith(2, null, {
      body: JSON.stringify({
        responseEnvelope: {
          timestamp: '2014-01-28T19:38:36.608-08:00',
          ack: 'Success',
          correlationId: 'd01b4d362904a',
          build: '7935900'
        },
        preapprovalKey: 'PA-4LK8116702912242Y'
      })
    });
  });

  after(function() {
    this.mock.restore();
  });

  it('should return a preapprovalKey', function(done) {
    var expect = this.expect;
    var options = {
      period: 'DAILY',
      startingDate: '2014-01-30Z',
      endingDate: '2015-01-30Z',
      maxAmountPerPayment: 1.97,
      maxTotalAmountOfAllPayments: '100.11',
      returnUrl: 'http://localhost:3000/paypal/success',
      cancelUrl: 'http://localhost:3000/paypal/cancel',
    };

    paypalClient.preapproval(options, function(err, body) {
      should.not.exist(err);
      should.exist(body.preapprovalKey);

      expect.calledWithMatch(function(value) {
        value.should.have.properties('currencyCode', 'requestEnvelope',
          'startingDate', 'endingDate', 'maxTotalAmountOfAllPayments',
          'returnUrl', 'cancelUrl');
        return true;
      }, function(value) {
        value.path.should.eql('/AdaptivePayments/Preapproval');
        return true;
      }, sinon.match.func).should.eql(true);

      done();
    });
  });
});

describe('Paypal#preapprovalDetails', function() {
  before(function() {
    this.mock = sinon.mock(paypalClient);
    this.expect = this.mock.expects('_httpsRequest');
    this.expect.callsArgWith(2, null, {
      body: JSON.stringify({
        responseEnvelope: {
          timestamp: '2014-01-28T18:44:23.527-08:00',
          ack: 'Success',
          correlationId: '36f8440309d2a',
          build: '7935900'
        },
        approved: 'false',
        cancelUrl: 'http://localhost:3000/paypal/cancel',
        curPayments: '0',
        curPaymentsAmount: '0.00',
        curPeriodAttempts: '0',
        currencyCode: 'USD',
        dateOfMonth: '0',
        dayOfWeek: 'NO_DAY_SPECIFIED',
        endingDate: '2014-12-31T00:00:00.000Z',
        maxAmountPerPayment: '1.02',
        maxTotalAmountOfAllPayments: '500.00',
        paymentPeriod: 'NO_PERIOD_SPECIFIED',
        pinType: 'NOT_REQUIRED',
        returnUrl: 'http://localhost:3000/paypal',
        memo: 'Donation to Romaguera-Kohler for $1.02 via Paypal',
        startingDate: '2014-01-29T00:00:00.000Z',
        status: 'ACTIVE',
        ipnNotificationUrl: 'http://localhost:3001/paypal/ipn',
        displayMaxTotalAmount: 'false'
      })
    });
  });

  after(function() {
    this.mock.restore();
  });

  it('should return some details', function(done) {
    var expect = this.expect;
    var key = 'Some328jkkxc83Random0mxc8923Key';
    paypalClient.preapprovalDetails(key, function(err, body) {
      should.not.exist(err);
      body.approved.should.eql('false');

      expect.calledWithMatch(function(value) {
        value.should
          .have.properties(['preapprovalKey', 'requestEnvelope']);
        return true;
      }, sinon.match.object, sinon.match.func).should.eql(true);

      done();
    });
  });
});

describe('Paypal#paymentDetails', function() {
  before(function() {
    this.mock = sinon.mock(paypalClient);
    this.expect = this.mock.expects('_httpsRequest');
    this.expect.callsArgWith(2, null, {
      body: JSON.stringify({
        responseEnvelope: {
          timestamp: '2014-01-24T08:04:06.937-08:00',
          ack: 'Success',
          correlationId: '36f33d39e4274',
          build: '7935900'
        },
        payKey: 'AP-8UA84743FW200633A',
        paymentExecStatus: 'COMPLETED',
        paymentInfoList: {
          paymentInfo: [{
            transactionId: '2XN392594V0905639',
            transactionStatus: 'COMPLETED',
            receiver: {
              amount: '1.05',
              email: 'merchant@example.com',
              primary: 'false',
              accountId: 'KJNBWCSQ4BJCY'
            },
            pendingRefund: 'false',
            senderTransactionId: '5WK02682RA311283P',
            senderTransactionStatus: 'COMPLETED'
          }]
        },
        sender: {
          accountId: 'XBHFDX9F2F4HU'
        }
      })
    });
  });

  after(function() {
    this.mock.restore();
  });

  it('should return some details', function(done) {
    var expect = this.expect;
    var key = '3189dfkvb9823fd8by';
    paypalClient.paymentDetails(key, function(err, body) {
      should.not.exist(err);

      body.should.have.properties('payKey', 'responseEnvelope',
        'sender', 'paymentInfoList');

      expect.calledWithMatch(function(value) {
        value.should
          .have.properties('payKey', 'requestEnvelope');
        return true;
      }, sinon.match.object, sinon.match.func).should.eql(true);

      done();
    });
  });
});

describe('Paypal#createCommandLink', function() {
  it('should return a url', function() {
    var link = paypalClient.createCommandLink({
      _cmd: '_another-cmd',
      myparam: 'sample_param'
    });

    link.should
      .match(/sandbox\.paypal.+cmd=_another-cmd&myparam=sample_param/);
  });
});

describe('Paypal#verify', function() {
  before(function() {
    nock('https://www.sandbox.paypal.com')
      .post('/cgi-bin/webscr?cmd=_notify-validate')
      .reply(200, 'VERIFIED');
  });

  after(function() {
    nock.restore();
  });

  it('should be called with a callback', function(done) {
    var body = {
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

    paypalClient.verify(body, function(err, result) {
      should.not.exist(err);
      //jshint expr: true
      result.should.be.true;
      done();
    });
  });

});
