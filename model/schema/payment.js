var mongoose = require('mongoose');
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

/**
 * Expose schema and model name
 * @type {object}
 */
module.exports = {
  schema: PaymentSchema,
  modelName: 'Payment'
};
