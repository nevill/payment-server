var today = new Date();

module.exports = {
  // Payemnt - the model class name, case sensitive
  Payment: [{ // for test/model/payment
    _id: '52f8c1bee6249c0000000001',
    kind: 'RECURRING',
    key: 'PA-RandomPreapprovalKey',
    startingAt: today.valueOf() - 86400 * 1000, // 1 day before
    endingAt: today.valueOf() + 86400 * 1000 * 180, // 180 days
    amount: 9.99,
    accruedAmount: 10.00,
    period: 'DAILY',
    callbackUrl: 'https://localhost/paypal?id=someRandomId28472329'
  }],
};
