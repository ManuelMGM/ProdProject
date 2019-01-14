const router = require('express').Router();

const { protected } = require('../middlewares');
const ProductType = require('../models/ProductType');

router.get('/', protected, async (req, res) => {
  try {
    const productsTypes = await ProductType.getAll();
    res.send(productsTypes);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const newType = await ProductType.create(req.body);
    res.send({ description: newType.description });
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.get('/search/:description', protected, async (req, res) => {
  try {
    const productType = await ProductType.getProduct(req.params.description);
    res.send(productType)
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

module.exports = router;