const { ZodError } = require('zod');
const mongoose = require('mongoose');
const { ApiError } = require('../utils/ApiError');
const { env } = require('../config/env');

function notFound(req, res) {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

// Every error leaves the API in the same shape:
// { error: { message, details?: [{ field, message }] } }
// The website and app show details[] next to the matching form fields.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return res.status(400).json({ error: { message: 'Validation failed', details } });
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: { message: `Invalid ${err.path}` } });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ error: { message: 'Validation failed', details } });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Request body is not valid JSON' } });
  }

  console.error(err);
  res.status(500).json({
    error: { message: env.nodeEnv === 'production' ? 'Something went wrong' : err.message },
  });
}

module.exports = { notFound, errorHandler };
