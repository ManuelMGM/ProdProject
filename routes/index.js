const router = require('express').Router();
const users = require('./users');
const products = require('./products');
const typesProducts = require('./typesProducts');
const providers = require('./providers');
const sales = require('./sales');
const salesDetails = require('./salesDetails');

const bodyParser = require('body-parser');

const { Token } = require('../utils');

// Inserting Bearer token value to request object. Ej: req.token
router.use(
  Token({
    headerKey: 'Bearer',
  })
);
router.use(bodyParser.json());
router.use('/users', users);
router.use('/products', products);
router.use('/providers', providers);
router.use('/sales', sales);
router.use('/salesDetails', salesDetails);
router.use('/typesProducts', typesProducts);

module.exports = router;
