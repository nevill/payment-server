var nock = require('nock');
var should = require('should');

var app = require('../../');
var ironWorker = app.get('ironWorker');

describe('Iron#enqueue', function() {
  before(function() {
    this.requestInfo = {
      url: 'http://www.example.org',
      body: {
        name: 'someone',
        email: 'someone@example.com',
        age: 31
      }
    };
  });

  describe('Response with status code 200', function() {
    before(function() {
      this.scope = nock('https://worker-aws-us-east-1.iron.io')
        .post('/2/projects/' + ironWorker.projectId + '/tasks')
        .reply(200, {
          message: 'queued up'
        });
    });

    after(function() {
      this.scope.done();
    });

    it('should be queued successfully', function(done) {
      ironWorker.enqueue(this.requestInfo, done);
    });
  });

  describe('Response without status code 200', function() {
    before(function() {
      this.scope = nock('https://worker-aws-us-east-1.iron.io')
        .post('/2/projects/' + ironWorker.projectId + '/tasks')
        .reply(403, {
          message: 'not authorized'
        });
    });

    after(function() {
      this.scope.done();
    });
    it('should be failed', function(done) {
      var url = this.requestInfo.url;
      ironWorker.enqueue(this.requestInfo, function(err) {
        should.exist(err);
        err.message.should.include(url);
        done();
      });
    });
  });
});
