const router = require('express').Router();

const { protected } = require('../middlewares');
const ProductType = require('../models/ProductType');
const status = require('../utils/statusCodes');

router.get('/', protected, async (req, res) => {
  try {
    const productsTypes = await ProductType.getAll();
    res.send(productsTypes);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const newType = await ProductType.create(req.body);
    res.send({ description: newType.description });
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.get('/search/:description', protected, async (req, res) => {
  try {
    const productType = await ProductType.getAllByKey(req.params.description);
    res.send(productType);
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

module.exports = router;
