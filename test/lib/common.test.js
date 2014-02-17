var nock = require('nock');
var should = require('should');

var Common = require('../../lib/common');

describe('Common.hasRequiredKeys', function() {

  before(function() {
    this.RequiredKeys = ['applicationId', 'name', 'email'];
  });

  it('should throw an error when a required key missed', function() {
    Common.hasRequiredKeys.bind(null, {
      name: 'ZhangSan',
      age: '16',
      email: 'ZhangSan@example.com'
    }, this.RequiredKeys).should.throw(/applicationId/);
  });
});

describe('Common.httpsRequest', function() {
  before(function() {
    this.sampleText = 'A sample body';
    this.requestBody = {
      name: 'somebody',
      age: '18'
    };
    this.scope = nock('https://www.example.com')
      .post('/path/to/test', this.requestBody)
      .reply(200, this.sampleText);
  });

  after(function() {
    this.scope.done();
  });

  it('should response with status code & body', function(done) {
    var options = {
      host: 'www.example.com',
      path: '/path/to/test',
      'Authorization': 'OAuth Some94921Random984kf7tkone',
    };
    var self = this;
    Common.httpsRequest(this.requestBody, options, function(err, resp) {
      should.not.exist(err);
      resp.statusCode.should.eql(200);
      resp.body.should.eql(self.sampleText);
      done();
    });
  });
});
