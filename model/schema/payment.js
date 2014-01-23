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
PaymentSchema.pre('save', true, function(next, done) {
  next();
  // initialize nextBilling date
  if (this.isNew && this.kind === constant.PAYMENT_TYPE.RECURRING) {
    var period = periodMap[this.period];
    this.nextBilling = moment(this.startingAt).add(period, 1);
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
