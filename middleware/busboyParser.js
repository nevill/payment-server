// We can use express-bodyParser instead of connect-busboy,
// until https://github.com/visionmedia/node-querystring/issues/95
// gets fixed
var json = require('express').json;
var busboy = require('connect-busboy');

module.exports = function(options) {
  var _json = json(options);
  var _busboy = busboy(options);

  return function(req, res, next) {
    _json(req, res, function(err) {
      if (req._body) {
        next(err);
      } else {
        _busboy(req, res, function() {
          if (req.busboy) {
            req.body = req.body || {};
            req.busboy.on('field', function(key, val) {
              req.body[key] = val;
            });

            req.busboy.on('end', function() {
              next();
            });
          } else {
            next();
          }
        });
      }
    });
  };
};
