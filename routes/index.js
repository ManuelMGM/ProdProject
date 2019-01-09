const router = require('express').Router();
const users = require('./users');
const { Token } = require('../utils');

// Inserting Bearer token value to request object. Ej: req.token
router.use(
  Token({
    headerKey: "Bearer"
  })
);
router.use('/users', users);

module.exports = router;
