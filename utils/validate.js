const isNumber = require('lodash').isFinite;

module.exports = {
  isString(str) {
    if (str === null) {
      return false;
    }

    return str.length > 0 && str.trim();
  },

  isNum(num) {
    return isNumber(parseFloat(num));
  },
};
