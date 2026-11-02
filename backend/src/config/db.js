const dns = require('dns');
const mongoose = require('mongoose');
const { env } = require('./env');

// Workaround for Windows/ISP local DNS servers failing to resolve SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '0.0.0.0']);
} catch (e) {
  // Ignore if custom DNS fails to set
}

async function connectDb() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB connected');
}

module.exports = { connectDb };
