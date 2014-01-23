var models = require('../model').models;

exports.create = function(req, res, next) {
  models.Payment.create(req.body, function(err) {
    if (err) {
      next(err);
    } else {
      res.send(201);
    }
  });
};
