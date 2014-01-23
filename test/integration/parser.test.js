var qs = require('qs');
var should = require('should');
var request = require('supertest');

var app = require('../../');

describe('When send a JSON request', function() {
  it('should response with it', function(done) {
    var obj = {
      books: [{
        name: 'Learning Java',
        authors: ['Patrick Niemeyer', 'Jonathan Knudsen'],
        'in stock': 12,
      }]
    };
    request(app)
      .post('/')
      .send(obj)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, obj)
      .end(function(err) {
        should.not.exist(err);
        done();
      });
  });
});

describe('When send form data', function() {
  it('should response with it', function(done) {
    var obj = {
      books: [{
        name: 'Learning Java',
        authors: ['Patrick Niemeyer', 'Jonathan Knudsen'],
        'in stock': 12,
      }, {
        name: 'PHP Cookbook',
        'in stock': 3,
      }]
    };
    request(app)
      .post('/')
      .send(qs.stringify(obj))
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .expect(200, done);
  });
});
