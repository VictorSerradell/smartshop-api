// src/middlewares/validate.middleware.js
const { ZodError } = require('zod');

/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * On failure it responds 400 with a list of field errors.
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    next(err);
  }
};

module.exports = { validate };
