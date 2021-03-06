const router = require('express').Router();

const { protected } = require('../middlewares');
const PaymentMethod = require('../models/PaymentMethod');

const status = require('../utils/statusCodes');

router.get('/', protected, async (req, res) => {
  try {
    const response = await PaymentMethod.getAll();
    res.send(response);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const newType = await PaymentMethod.create(req.body);
    res.send({ description: newType.description });
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

module.exports = router;
