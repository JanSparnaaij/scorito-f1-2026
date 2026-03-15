import dotenv from 'dotenv';
import path from 'path';

// Load .env only in development
if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
  console.log('Loaded .env file for local development');
} else {
  console.log('Using environment variables from hosting provider');
}

import Fastify from 'fastify';
import cors from '@fastify/cors';
import routes from './routes';

const server = Fastify({ logger: true });

const start = async () => {
  try {
    await server.register(cors, {
      origin: (origin, cb) => {
        const allowedOrigins = [
          'http://localhost:5173',
          'http://localhost:3000',
          process.env.FRONTEND_URL,
          /\.vercel\.app$/,
        ].filter(Boolean);

        if (
          !origin ||
          allowedOrigins.some((allowed) => {
            if (typeof allowed === 'string') return origin === allowed;
            if (allowed instanceof RegExp) return allowed.test(origin);
            return false;
          })
        ) {
          cb(null, true);
        } else {
          // Allow all for development simplicity
          cb(null, true);
        }
      },
      credentials: true,
    });

    server.get('/', async () => ({
      status: 'ok',
      message: 'Scorito F1 2026 API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        drivers: '/api/drivers',
        constructors: '/api/constructors',
        races: '/api/races',
        prices: '/api/prices',
        syncDrivers: 'POST /api/drivers/sync',
        syncRaces: 'POST /api/races/sync',
        syncResults: 'POST /api/results/sync/:raceSlug',
      },
    }));

    server.get('/health', async () => ({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    }));

    await server.register(routes, { prefix: '/api' });

    const port = parseInt(process.env.PORT || '3000', 10);
    await server.listen({ port, host: '0.0.0.0' });

    console.log(`✅ Server running at http://0.0.0.0:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
