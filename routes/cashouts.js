const router = require('express').Router();

const { protected } = require('../middlewares');
const CashOut = require('../models/CashOut');

const isBefore = require('date-fns/is_before');
const { stringToDate } = require('../utils/dates');

router.get('/', protected, async (req, res) => {
  try {
    let cashMoves;
    if (!req.query.from && !req.query.to) {
      cashMoves = await CashOut.getAll();
      res.send(cashMoves);
    } else if (req.query.from && req.query.to) {
      const from = stringToDate(req.query.from);
      const to = stringToDate(req.query.to);
      console.log('dates', from, to);
      if (isBefore(from, to)) {
        cashMoves = await CashOut.getEntitiesByRangeDates(from, to);
        const amount = await CashOut.getCheckOutSum(from, to);
        res.send({ amount, cashMoves });
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
    const { description, id_User, amount } = req.body;
    const cashMoved = await CashOut.create({ description, id_User, amount });
    res.send(cashMoved);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.delete('/:id', protected, async (req, res) => {
  try {
    const cashDeleted = await CashOut.delete(req.params.id);
    res.send(cashDeleted);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

module.exports = router;
