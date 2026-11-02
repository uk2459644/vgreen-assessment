const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { env } = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Render and similar hosts sit behind a proxy; needed for correct client IPs (rate limiting).
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// The mobile app does not send an Origin header, so it is never blocked by CORS.
// Browsers (the website and admin) must be listed in CORS_ORIGINS.
app.use(
  cors({
    origin: env.corsOrigins.includes('*') ? true : env.corsOrigins,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
  })
);

app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => res.json({ name: 'Tribe Green API', docs: '/api/health' }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
