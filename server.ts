import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fetchDonkiSpaceWeather, fetchRadLabIssSample } from './server/nasaProxy.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000);

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'outpost-14-nasa-proxy',
      hasCustomKey: Boolean(process.env.NASA_API_KEY?.trim() && process.env.NASA_API_KEY !== 'DEMO_KEY'),
    });
  });

  app.get('/api/nasa/donki', async (_req, res) => {
    const payload = await fetchDonkiSpaceWeather();
    res.json(payload);
  });

  app.get('/api/nasa/radlab', async (_req, res) => {
    const payload = await fetchRadLabIssSample();
    res.json(payload);
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`OUTPOST 14 server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
