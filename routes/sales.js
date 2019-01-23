const router = require('express').Router();

const { protected } = require('../middlewares');
const Sale = require('../Models/Sale');

const isValid = require('date-fns/is_valid');
const parse = require('date-fns/parse');

router.get('/', async (req, res) => {
  try {
    let sales;
    if (req.query.from && req.query.to) {
      const regex = /^0[123]([./-])\d{2}\1\d{4}$/;
      const from = regex.test(req.query.from)
        ? parse(req.query.from)
        : parse(+req.query.from);
      const to = regex.test(req.query.to)
        ? parse(req.query.to)
        : parse(+req.query.to);
      sales = await Sale.getSalesByRangeDates(from, to);
      const amount = await Sale.getSalesSum();
      res.send({sales, amount});
    } else {
      sales = await Sale.getAll();
      res.send(sales);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.post('/', async (req, res) => {
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
