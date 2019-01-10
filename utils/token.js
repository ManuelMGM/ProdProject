/**
 * Represents a book.
 * @param {object} options - Available options to get token from
 * @returns {function} middleware - Returns a middleware function with req, res and next as parameters
 */

module.exports = opts => {
  // Checking for parameters
  if (!opts) {
    opts = {};
  }

  // Reading options from opts parameter and falling back
  // to default values
  const queryKey = opts.queryKey || 'access_token';
  const bodyKey = opts.bodyKey || 'access_token';
  const headerKey = opts.headerKey || 'Bearer';
  const reqKey = opts.reqKey || 'token';

  // Returning function that takes express middleware params
  return (req, res, next) => {
    // Declaring variables
    let token, error;

    if (req.query && req.query[queryKey]) {
      // If token is coming from query params, set it here
      token = req.query[queryKey];
    }

    if (req.body && req.body[bodyKey]) {
      if (token) {
        // If token is not coming, set error to true
        error = true;
      }
      // If token is coming from request body, set it here
      token = req.body[bodyKey];
    }

    if (req.headers && req.headers.authorization) {
      // Getting token from authorization header
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === headerKey) {
        if (token) {
          error = true;
        }
        token = parts[1];
      }
    }

    // RFC6750 states the access_token MUST NOT be provided
    // in more than one place in a single request.
    if (error) {
      res.status(403).send();
    } else {
      req[reqKey] = token;
      next();
    }
  };
};
