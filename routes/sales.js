const router = require('express').Router();

const { protected } = require('../middlewares');
const Sale = require('../Models/Sale');

const isBefore = require('date-fns/is_before');
const dates = require('../utils/dates');

router.get('/', async (req, res) => {
  try {
    let sales;
    if (!req.query.from && !req.query.to) {
      sales = await Sale.getAll();
      res.send(sales);
    } else if (req.query.from && req.query.to) {
      const from = dates.stringToDate(req.query.from);
      const to = dates.stringToDate(req.query.to);
      if (isBefore(from, to)) {
        sales = await Sale.getSalesByRangeDates(from, to);
        const amount = await Sale.getSalesSum(from, to);
        res.send({ sales, amount });
      } else {
        res.status(400).send('Verify dates.');
      }
    } else {
      res.status(400).send('Both dates must be included.');
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const { type, amount, details } = req.body;
    if (details && details.length) {
      const newSale = await Sale.create({ type, amount, details });
      res.send({
        number: newSale.number,
        type: newSale.type,
        amount: newSale.amount,
      });
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.get('/search/:number', protected, async (req, res) => {
  try {
    const sale = await Sale.getSale(req.params.number);
    res.send(sale);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

module.exports = router;