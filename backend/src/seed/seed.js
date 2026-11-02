// Usage: npm run seed
// Safe to run repeatedly: it replaces the product catalogue, leaves enquiries alone.
const mongoose = require('mongoose');
const { assertEnv } = require('../config/env');
const { connectDb } = require('../config/db');
const { ensureAdmin } = require('../controllers/adminController');
const Product = require('../models/Product');
const products = require('./products');

async function run() {
  assertEnv();
  await connectDb();
  await ensureAdmin();

  await Product.deleteMany({});
  const created = await Product.insertMany(products);
  console.log(`Seeded ${created.length} products`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
