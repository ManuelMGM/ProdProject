const router = require('express').Router();

const { protected } = require('../middlewares');
const CashShift = require('../models/CashShift');
const status = require('../utils/statusCodes');

router.get('/', protected, async (req, res) => {
  try {
    const shifts = await CashShift.getAll();
    res.send(shifts);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.get('/last', protected, async (req, res) => {
  try {
    const fewShifts = await CashShift.getClosestShift();
    res.send(fewShifts);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const newCashShift = await CashShift.create({ ...req.body });
    res.send(newCashShift);
  } catch (e) {
    console.error(e);
    res.status(status.INTERNAL_ERROR).send(e.message);
  }
});

module.exports = router;
