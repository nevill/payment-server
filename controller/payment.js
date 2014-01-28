// bind all the actions to a context object defined in /index.js:
//   {app: app, model: model}

exports.create = function(req, res, next) {
  this.model.Payment.create(req.body, function(err) {
    if (err) {
      next(err);
    } else {
      res.send(201);
    }
  });
};
