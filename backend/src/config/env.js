require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  corsOrigins: (process.env.CORS_ORIGINS || '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

// Called once at startup so a missing variable fails loudly and early.
function assertEnv() {
  const missing = [];
  if (!env.mongoUri) missing.push('MONGODB_URI');
  if (!env.jwtSecret) missing.push('JWT_SECRET');
  if (!env.adminUsername) missing.push('ADMIN_USERNAME');
  if (!env.adminPassword) missing.push('ADMIN_PASSWORD');
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}. See .env.example`);
  }
}

module.exports = { env, assertEnv };
