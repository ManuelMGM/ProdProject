const router = require('express').Router();

const { protected } = require('../middlewares');
const Sale = require('../models/Sale');

const isBefore = require('date-fns/is_before');
const { stringToDate } = require('../utils/dates');

router.get('/search/:number', protected, async (req, res) => {
  try {
    const sale = await Sale.getSale(req.params.number);
    res.send(sale);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.get('/', protected, async (req, res) => {
  try {
    let sales;
    if (!req.query.from && !req.query.to) {
      if (req.query.idProduct) {
        sales = await Sale.getSaleWithProduct(req.query.idProduct);
        sales ? res.send(sales) : res.send({});
      } else {
        sales = await Sale.getAll();
        res.send(sales);
      }
    } else if (req.query.from && req.query.to) {
      const from = stringToDate(req.query.from);
      const to = stringToDate(req.query.to);
      if (isBefore(from, to)) {
        if (req.query.idProduct) {
          sales = await Sale.getSaleWithProductByDates(
            req.query.idProduct,
            from,
            to
          );
          sales ? res.send(sales) : res.send({});
        } else {
          sales = await Sale.getSalesByRangeDates(from, to);
          const amount = await Sale.getSalesSum(from, to);
          res.send({ amount, sales });
        }
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
    const { type, amount, id_User, details } = req.body;
    const newSale = await Sale.create({ type, amount, id_User, details });
    newSale
      ? res.send('SALE COMMITED')
      : res.status(400).send('Validate data format.');
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
