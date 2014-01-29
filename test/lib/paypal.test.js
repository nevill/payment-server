var nock = require('nock');
var should = require('should');

var app = require('../../');
var paypalClient = app.get('paypalClient');

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
      .reply(200, 'VALID');
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

    paypalClient.verify(body, function(err, resp) {
      should.not.exist(err);
      resp.body.should.eql('VALID');
      done();
    });
  });

});
