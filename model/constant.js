function transform(arr) {
  return arr.reduce(function(obj, value) {
    obj[value] = value;
    return obj;
  }, {});
}

module.exports = {
  'PAYMENT_STATUS': transform(['CREATED', 'ACTIVE', 'COMPLETED']),
  'PAYMENT_TYPE': transform(['SINGLE', 'RECURRING']),
  'PAYMENT_PERIOD': transform([
    'DAILY', 'WEEKLY', 'MONTHLY', 'ANNUALLY'
  ]),
};
