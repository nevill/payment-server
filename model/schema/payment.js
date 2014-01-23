var mongoose = require('mongoose');

var PAYMENT_STATUS = ['CREATED', 'ACTIVE', 'COMPLETED'];
var PAYMENT_TYPE = ['SINGLE', 'RECURRING'];
var PAYMENT_PERIOD = [
  'DAILY', 'WEEKLY', 'BIWEEKLY', 'SEMIMONTHLY', 'MONTHLY', 'ANNUALLY'
];

var PaymentSchema = new mongoose.Schema({
  kind: { // will affect 'status'
    type: String,
    enum: PAYMENT_TYPE
  },
  status: {
    type: String,
    enum: PAYMENT_STATUS
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
