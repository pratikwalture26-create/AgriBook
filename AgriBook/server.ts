/**
 * AgriBook Standalone Express Server Entrypoint
 * Smart India Hackathon 2026 (SIH26032)
 * Ministry of Consumer Affairs, Food & Public Distribution
 */

import express from 'express';
import path from 'path';
import { apiRouter } from './backend/src/routes/apiRoutes';

const app = express();
const PORT = 3000;

app.use(express.json());

// Mount API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'AgriBook (SIH26032)',
    timestamp: new Date().toISOString(),
  });
});

// Production static file serving
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// In development when launched directly
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AgriBook Backend] Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
