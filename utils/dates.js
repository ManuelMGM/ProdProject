const { parse, isValid } = require('date-fns');

module.exports = {
  stringToDate(str) {
    try {
      return isValid(parse(str)) ? parse(str) : parse(+str);
    } catch (e) {
      console.error(e);

      return;
    }
  },
};
