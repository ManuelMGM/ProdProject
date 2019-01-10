const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  jwt.verify(req.token, process.env.PRIVATE_KEY, (err, authorizedData) => {
    if (err) {
      console.log(
        'ERROR: Could not connect to the protected route.',
        err.message
      );
      res.status(403).send(err.message);
    } else {
      console.log('SUCCESS: Connect to the protected route');
      next();
    }
  });
};
