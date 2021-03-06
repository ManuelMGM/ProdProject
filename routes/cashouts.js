const router = require('express').Router();

const { protected } = require('../middlewares');
const CashOut = require('../models/CashOut');

const isBefore = require('date-fns/is_before');
const { stringToDate } = require('../utils/dates');

const status = require('../utils/statusCodes');

router.get('/', protected, async (req, res) => {
  try {
    let cashMoves;
    if (!req.query.from && !req.query.to) {
      cashMoves = await CashOut.getAll();
      res.send(cashMoves);
    } else if (req.query.from && req.query.to) {
      const from = stringToDate(req.query.from);
      const to = stringToDate(req.query.to);
      if (isBefore(from, to)) {
        cashMoves = await CashOut.getEntitiesByRangeDates(from, to);
        const amount = await CashOut.getCheckOutSum(from, to);
        res.send({ amount, cashMoves });
      } else {
        res.status(status.BAD_REQUEST).send('Verify dates.');
      }
    } else {
      res.status(status.BAD_REQUEST).send('Both dates must be included.');
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.get('/:userId', protected, async (req, res) => {
  try {
    if (req.params.userId) {
      const cashMoves = await CashOut.getByUser(req.params.userId);
      res.send(cashMoves);
    } else {
      res.send({});
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const { description, id_User, amount } = req.body;
    const cashMoved = await CashOut.create({ description, id_User, amount });
    res.send(cashMoved);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.delete('/:id', protected, async (req, res) => {
  try {
    const cashDeleted = await CashOut.delete(req.params.id);
    res.send(cashDeleted);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

module.exports = router;
