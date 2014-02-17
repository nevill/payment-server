var nock = require('nock');
var should = require('should');

var app = require('../../');
var ironWorker = app.get('ironWorker');

describe('Iron#enqueue', function() {

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
    var requestInfo = {
      url: 'http://www.example.org',
      body: {
        name: 'someone',
        email: 'someone@example.com',
        age: 31
      }
    };
    ironWorker.enqueue(requestInfo, function(err, result) {
      should.not.exist(err);
      result.should.eql(true);
      done();
    });
  });
});
