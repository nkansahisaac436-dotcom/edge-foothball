import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import apiRoutes from './routes/api.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Matchday Edge API',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', apiRoutes);

// In production, serve static files from client/dist if present
const clientDistPath = path.resolve(process.cwd(), '../client/dist');
const localDistPath = path.resolve(process.cwd(), 'client/dist');
const staticPath = fs.existsSync(clientDistPath) ? clientDistPath : fs.existsSync(localDistPath) ? localDistPath : null;

if (staticPath) {
  console.log(`Serving static client files from: ${staticPath}`);
  app.use(express.static(staticPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

const portNumber = Number(PORT);
if (process.env.VERCEL !== '1') {
  app.listen(portNumber, '0.0.0.0', () => {
    console.log(`🚀 Matchday Edge backend listening on http://127.0.0.1:${portNumber}`);
    console.log(`📡 Ready for live predictions & market calculations`);
  });
}

export default app;
export { app };
