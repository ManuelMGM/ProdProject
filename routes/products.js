const router = require('express').Router();

const { protected } = require('../middlewares');
const Product = require('../models/Product');

router.get('/search', protected, async (req, res) => {
  try {
    if (req.query.term) {
      const product = await Product.getProductByDescription(req.query.term);
      res.send(product);
    } else {
      res.send({});
    }
  } catch (e) {
    console.error(e);
    res.status(400);
  }
});

router.get('/', protected, async (req, res) => {
  try {
    const products = await Product.getAll();
    res.send(products);
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.get('/:id', protected, async (req, res) => {
  try {
    if (req.params.id) {
      const product = await Product.getProduct(req.params.id);
      res.send(product);
    } else {
      res.send({});
    }
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

router.put('/:productId', protected, async (req, res, next) => {
  try {
    if (req.params.productId) {
      if (Product.validateAttributes(req.body)) {
        const product = await Product.updateProduct(req.body);
        res.send(product);
      } else {
        res.status(400).send('Validate properties values.');
      }
    } else {
      res.send({});
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

router.put('/', protected, async (req, res, next) => {
  try {
    const products = req.body.products;
    if (products && Array.isArray(products)) {
      updatedProducts = await Product.updateMultiple(products);
      updatedProducts
        ? res.send(updatedProducts)
        : res.status(400).send('Validate properties values.');
    } else {
      res.status(400).send('Validate properties format.');
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(400);
  }
});

module.exports = router;
