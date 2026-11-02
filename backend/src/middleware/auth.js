const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { ApiError } = require('../utils/ApiError');

// Protects admin routes. Expects:  Authorization: Bearer <token>
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Login required'));
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (payload.role !== 'admin') throw new Error('not admin');
    req.admin = { username: payload.sub };
    next();
  } catch (err) {
    next(new ApiError(401, 'Session expired or invalid. Please log in again.'));
  }
}

module.exports = { requireAdmin };
