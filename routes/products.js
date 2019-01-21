const router = require('express').Router();

const { protected } = require('../middlewares');
const Product = require('../models/Product');

router.get('/', protected, async (req, res) => {
  try {
    const products = await Product.getAll();
    res.send(products);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.post('/', protected, async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.send({
      id: newProduct.id,
      price: newProduct.price,
      description: newProduct.description,
      typeProduct: newProduct.typeProduct,
      id_Provider: newProduct.id_Provider,
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.get('/search/:id', protected, async (req, res) => {
  try {
    const product = await Product.getProduct(req.params.id);
    res.send(product);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

module.exports = router;
