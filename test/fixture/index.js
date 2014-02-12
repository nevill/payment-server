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
  }, {
    _id: '52fa10d7aa3c92020081885b',
    amount: 0.99,
    callbackUrl: 'http://localhost/donation/donationId',
    key: 'AP-RandomPayKey',
    kind: 'SINGLE',
    receivers: [
      'merchant@example.com'
    ],
    status: 'CREATED'
  }],
};
