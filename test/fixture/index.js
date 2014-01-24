var today = new Date();

module.exports = {
  // Payemnt - the model class name, case sensitive
  Payment: [{ // for test/model/payment
    kind: 'RECURRING',
    key: 'PA-RandomPreapprovalKey',
    startingAt: today.valueOf() - 86400 * 1000, // 1 day before
    endingAt: today.valueOf() + 86400 * 1000 * 180, // 180 days
    senderEmail: 'recurring@example.com',
    amount: 9.99,
    accruedAmount: 10.00,
    period: 'DAILY',
    callbackUrl: 'https://localhost/paypal?id=someRandomId28472329'
  }],
};
