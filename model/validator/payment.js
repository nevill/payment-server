module.exports = function(schema) {
  schema.path('kind')
    .required(true, 'Must specify a type of payment');

  schema.path('status')
    .required(true, 'Must specify a status');

  schema.path('callbackUrl')
    .required(true, 'Must specify a callback url');
};
