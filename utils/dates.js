const parse = require('date-fns/parse');

module.exports = {
  stringToDate(str) {
    try {
      const regex = /^0[1-9]|1[0-2]([./-])\d{2}\1\d{4}$/;

      return regex.test(str) ? parse(str) : parse(+str);
    } catch (e) {
      console.error(e);

      return;
    }
  },
};
