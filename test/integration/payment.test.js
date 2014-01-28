var should = require('should');
var request = require('supertest');

var common = require('./common');
var app = common.app;
var db = common.db;
var model = db.models;

before(function(done) {
  db.init(done);
});

describe('Payment creation', function() {
  it('should create a new payment entry', function(done) {
    var paymentAttrs = {
      kind: 'SINGLE',
      key: 'Some Random Pay Key',
      senderEmail: 'guest@example.com',
      amount: 9.89,
      status: 'COMPLETED',
      callbackUrl: 'https://localhost/paypal?id=someRandomId28472329'
    };

    model.Payment.count(function(err, total) {
      should.not.exist(err);
      request(app)
        .post('/payments')
        .set('Content-Type', 'application/json')
        .send(paymentAttrs)
        .expect(201)
        .end(function(err) {
          should.not.exist(err);
          model.Payment.count(function(err, newTotal) {
            newTotal.should.eql(total + 1);
            done();
          });
        });
    });
  });
});
