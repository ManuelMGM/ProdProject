module.exports = {
  isString(str) {
    if (str === null) {
      return false;
    }

    return str.length > 0 && str.trim();
  },

  isNum(num) {
    if (num === '0') {
      return true;
    }

    return parseFloat(num) && isFinite(num);
  },
};
