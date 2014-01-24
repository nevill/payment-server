var constant = require('../constant');
var instanceMethods = {};

// Execute a recurring payment
instanceMethods.execute = function(data, done) {
  if (this.kind === constant.PAYMENT_TYPE.RECURRING) {
    this.accruedAmount += data.amount;
    var now = new Date();
    this.lastBilling = now;
    this.history.push({
      payKey: data.payKey,
      amount: data.amount,
      receivers: data.receivers,
      createdAt: now,
    });

    this.save(done);
  }
  else {
    done();
  }
};

module.exports = function(schema) {
  schema.method(instanceMethods);
};
