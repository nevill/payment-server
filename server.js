var nconf = require('nconf');
var mongoose = require('mongoose');

var app = require('./');

mongoose.connect(nconf.get('database:url'), function(err) {
  if (err) {
    console.error('mongodb error:', err.message);
  } else {
    var port = process.env.PORT || 3000;
    app.listen(port, function() {
      console.log('Listening on port', port);
    });
  }
});
