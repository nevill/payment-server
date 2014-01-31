var mongoose = require('mongoose');
var moment = require('moment');
var constant = require('../constant');

var PaymentSchema = new mongoose.Schema({
  kind: { // will affect 'status'
    type: String,
    enum: Object.keys(constant.PAYMENT_TYPE)
  },
  status: {
    type: String,
    default: constant.PAYMENT_STATUS.CREATED,
    enum: Object.keys(constant.PAYMENT_STATUS)
  },
  key: { // a PayKey or PreapprovalKey
    type: String
  },
  trackingId: { // the id passed by IPN call
    type: String
  },
  callbackUrl: {
    type: String
  },
  startingAt: {
    type: Date
  },
  endingAt: {
    type: Date
  },
  period: {
    type: String,
    enum: Object.keys(constant.PAYMENT_PERIOD)
  },
  receivers: [{
    type: String // receiver's email address
  }],
  senderEmail: {
    type: String
  },
  lastBilling: {
    type: Date
  },
  nextBilling: {
    type: Date
  },
  amount: { // amount to pay each time
    type: Number
  },
  accruedAmount: { // total amount has been paid
    type: Number
  },
  history: { // to store the recurring payment invoice
    type: Array,
    default: []
  },
}, {
  collection: 'Payment'
});

var periodMap = {
  DAILY: 'd',
  WEEKLY: 'w',
  MONTHLY: 'M',
  ANNUALLY: 'y'
};

// set attribute nextBilling
PaymentSchema.pre('save', true, function(next, done) {
  next();
  if (this.kind === constant.PAYMENT_TYPE.RECURRING) {
    var period = periodMap[this.period];
    if (this.isNew) {
      this.nextBilling = moment(this.startingAt).add(period, 1);
    } else {
      this.nextBilling = moment(this.lastBilling).add(period, 1);
    }
  }
  done();
});

/**
 * Expose schema and model name
 * @type {object}
 */
module.exports = {
  schema: PaymentSchema,
  modelName: 'Payment'
};
