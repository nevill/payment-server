var today = new Date();

module.exports = {
  // Payemnt - the model class name, case sensitive
  Payment: [{
    // used in test/model/payment
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
    // for Payment.findDues
    _id: '530318bed1cfcc02003392e4',
    kind: 'RECURRING',
    key: 'PA-RandomPreapprovalKey',
    startingAt: today.valueOf() - 86400 * 1000, // 1 day before
    endingAt: today.valueOf() + 86400 * 1000 * 180, // 180 days
    nextBilling: today.valueOf(),
    amount: 3.59,
    accruedAmount: 20.41,
    period: 'MONTHLY',
    status: 'ACTIVE',
    callbackUrl: 'https://localhost/donation?id=someRandomId28472329'
  }, {
    // used in test/model/payment
    _id: '53032e6efcc7cca72fecb3c3',
    kind: 'RECURRING',
    key: 'A Random Preapproval Key',
    startingAt: new Date(2013, 11, 31),
    endingAt: new Date(2014, 11, 31),
    senderEmail: 'guest@example.com',
    amount: 1.99,
    period: 'MONTHLY',
    receivers: ['someone@example.com'],
    callbackUrl: 'https://localhost/paypal?id=someRandomId28472329'
  }, {
    // used in test/model/payment
    _id: '53034ad856670b9198b1de9f',
    kind: 'RECURRING',
    key: 'A Random Preapproval Key',
    startingAt: new Date(2014, 0, 1),
    endingAt: new Date(),
    nextBilling: new Date(2014, 1, 2),
    lastBilling: new Date(2014, 0, 2),
    senderEmail: 'buyer@example.com',
    amount: 5.99,
    period: 'MONTHLY',
    status: 'ACTIVE',
    receivers: ['someone@example.com'],
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
