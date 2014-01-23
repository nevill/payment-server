var should = require('should');
var request = require('supertest');

var db = require('../database');
var models = db.models;
var app = require('../../');

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

    models.Payment.count(function(err, total) {
      should.not.exist(err);
      request(app)
        .post('/payments')
        .set('Content-Type', 'application/json')
        .send(paymentAttrs)
        .expect(201)
        .end(function(err) {
          should.not.exist(err);
          models.Payment.count(function(err, newTotal) {
            newTotal.should.eql(total + 1);
            done();
          });
        });
    });
  });
});
