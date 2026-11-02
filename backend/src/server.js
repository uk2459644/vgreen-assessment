const { env, assertEnv } = require('./config/env');
const { connectDb } = require('./config/db');
const { ensureAdmin } = require('./controllers/adminController');
const app = require('./app');

async function start() {
  assertEnv();
  await connectDb();
  await ensureAdmin();
  app.listen(env.port, () => console.log(`Tribe Green API listening on port ${env.port}`));
}

start().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
