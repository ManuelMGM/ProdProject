const router = require('express').Router();

const { protected } = require('../middlewares');
const SaleDetail = require('../models/SaleDetail');

router.get('/:number', protected, async (req, res) => {
  try {
    const saleDetail = await SaleDetail.getAll(req.params.number);
    res.send(saleDetail);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const newDetail = await SaleDetail.create(req.body);
    res.send({ item: newDetail.item,
        saleNumber: newDetail.saleNumber, 
        type: newDetail.type,
        codProduct: newDetail.codProduct,
        quantity:newDetail.quantity,
        price: newDetail.price });
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

module.exports = router;