const router = require('express').Router();

const { protected } = require('../middlewares');
const TypeProduct = require('../models/TypeProduct');

router.get('/', protected, async (req, res) => {
  try {
    const typesProducts = await TypeProduct.getAll();
    res.send(typesProducts);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const newType = await TypeProduct.create(req.body);
    res.send({ description: newType.description });
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.get('/search/:description', protected, async (req, res) => {
  try {
    const typeProduct = await TypeProduct.getProduct(req.params.description);
    res.send(typeProduct)
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

module.exports = router;