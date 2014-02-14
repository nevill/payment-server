exports.hasRequiredKeys = function hasRequiredKeys(object, keyNames) {
  var missedKeys = keyNames.reduce(function(missedKeys, key) {
    if (!Object.hasOwnProperty.call(object, key)) {
      missedKeys.push(key);
    }
    return missedKeys;
  }, []);

  if (missedKeys.length > 0) {
    throw new Error(
      'Missing required parameter: ' + missedKeys.join(',')
    );
  }
  return true;
};
