module.exports = {
  isString(str) {
    if (str == null) {
      return false;
    }

    return str.length > 0 && str.trim();
  },

  isNum(num) {
    if (num == null) {
      return false;
    }

    return !isNaN(parseFloat(num)) && isFinite(num);
  },
};
