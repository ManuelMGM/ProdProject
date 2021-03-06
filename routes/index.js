const router = require('express').Router();
const users = require('./users');
const usersTypes = require('./usersTypes');
const products = require('./products');
const paymentMethods = require('./paymentMethods');
const productsTypes = require('./productsTypes');
const providers = require('./providers');
const sales = require('./sales');
const cashouts = require('./cashouts');
const cashShifts = require('./cashShifts');

const bodyParser = require('body-parser');

const { Token } = require('../utils');

// Inserting Bearer token value to request object. Ej: req.token
router.use(
  Token({
    headerKey: 'Bearer',
  })
);
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use('/users', users);
router.use('/usersTypes', usersTypes);
router.use('/products', products);
router.use('/paymentMethods', paymentMethods);
router.use('/productsTypes', productsTypes);
router.use('/providers', providers);
router.use('/sales', sales);
router.use('/cashouts', cashouts);
router.use('/cashShifts', cashShifts);

module.exports = router;
