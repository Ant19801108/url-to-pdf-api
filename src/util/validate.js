// Lightweight replacement for the abandoned `express-validation` package.
// Validates `req.query` and/or `req.body` against Joi schemas and forwards a
// 400 error on failure.

function validate({ query, body }) {
  return (req, res, next) => {
    if (query) {
      const { error } = query.validate(req.query, { allowUnknown: false, abortEarly: false });
      if (error) {
        const err = new Error(`Query validation failed: ${error.message}`);
        err.status = 400;
        return next(err);
      }
    }

    if (body) {
      const { error } = body.validate(req.body, { allowUnknown: false, abortEarly: false });
      if (error) {
        const err = new Error(`Body validation failed: ${error.message}`);
        err.status = 400;
        return next(err);
      }
    }

    return next();
  };
}

module.exports = validate;
