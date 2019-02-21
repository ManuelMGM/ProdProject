const router = require('express').Router();

const { protected } = require('../middlewares');
const Product = require('../models/Product');
const status = require('../utils/statusCodes');
const Sale = require('../models/Sale');

const isBefore = require('date-fns/is_before');
const { stringToDate } = require('../utils/dates');

router.get('/search', protected, async (req, res) => {
  try {
    if (req.query.term) {
      const product = await Product.getProductByDescription(req.query.term);
      res.send(product);
    } else {
      if (req.query.order) {
        const products = await Product.getProductOrderBy(req.query.order);
        res.send(products);
      } else {
        res.send({});
      }
    }
  } catch (e) {
    console.error(e);
    res.status(status.INTERNAL_ERROR);
  }
});

router.get('/', protected, async (req, res) => {
  try {
    if (req.query.order) {
      const products = await Product.getProductOrderBy(req.query.order);
      res.send(products);
    } else {
      const products = await Product.getAll();
      res.send(products);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.get('/:id', protected, async (req, res) => {
  try {
    if (req.params.id) {
      const product = await Product.getEntity(req.params.id);
      res.send(product);
    } else {
      res.send({});
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.get('/:productId/sales', protected, async (req, res) => {
  try {
    let sales;
    let sum;
    if (req.params.productId) {
      if (!req.query.from && !req.query.to) {
        sales = await Sale.getSaleWithProduct(req.params.productId);
        [sum] = await Sale.getSaleSumWithProduct(req.params.productId);
        
        res.send({ ...sum, sales });
      } else if (req.query.from && req.query.to) {
        const from = stringToDate(req.query.from);
        const to = stringToDate(req.query.to);
        if (isBefore(from, to)) {
          sales = await Sale.getSaleWithProductByRange(
            req.params.productId,
            from,
            to
          );
          [sum] = await Sale.getSaleSumWithProductByRange(
            req.params.productId,
            from,
            to
          );

          res.send({ ...sum, sales });
        } else {
          res.status(status.BAD_REQUEST).send('Verify dates.');
        }
      } else {
        res.status(status.BAD_REQUEST).send('Both dates must be included.');
      }
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
    if (req.body.codProduct && req.body.description) {
      const newProduct = await Product.create(req.body);
      res.send({
        id: newProduct.id,
        salePrice: newProduct.salePrice,
        costPrice: newProduct.costPrice,
        description: newProduct.description,
        typeProduct: newProduct.typeProduct,
        id_Provider: newProduct.id_Provider,
      });
    } else {
      res.status(status.BAD_REQUEST).send('Validate properties.');
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.put('/:productId', protected, async (req, res, next) => {
  try {
    if (req.params.productId) {
      if (Product.validateAttributes(req.body)) {
        const product = await Product.updateEntity(req.body);
        res.send(product);
      } else {
        res.status(status.BAD_REQUEST).send('Validate properties values.');
      }
    } else {
      res.send({});
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

router.put('/', protected, async (req, res, next) => {
  try {
    const products = req.body.products;
    if (products && Array.isArray(products)) {
      updatedProducts = await Product.updateMultiple(products);
      updatedProducts
        ? res.send(updatedProducts)
        : res.status(status.BAD_REQUEST).send('Validate properties values.');
    } else {
      res.status(status.BAD_REQUEST).send('Validate properties format.');
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(status.INTERNAL_ERROR);
  }
});

module.exports = router;
