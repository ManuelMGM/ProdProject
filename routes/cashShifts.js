const router = require('express').Router();

const { protected } = require('../middlewares');
const CashShift = require('../models/CashShift');

router.get('/', protected, async (req, res) => {
  try {
    const shifts = await CashShift.getAll();
    res.send(shifts);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.get('/last', protected, async (req, res) => {
  try {
    const fewShifts = await CashShift.getClosestShift();
    res.send(fewShifts);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const newCashShift = await CashShift.create({ ...req.body });
    res.send(newCashShift);
  } catch (e) {
    console.error(e);
    res.status(400).send(e.message);
  }
});

module.exports = router;
