const bodyParser = require('body-parser');
const users = require('./users');

const { Token } = require('../utils');

module.exports = app => {
  // Inserting Bearer token value to request object. Ej: req.token
  app.use(
    Token({
      headerKey: 'Bearer',
    })
  );
  // Setting bodyparser middleware to routes
  app.use(bodyParser.json());

  // Users endpoint
  users(app);
};
