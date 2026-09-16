import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// CORS middleware for cross-origin client requests (PWA, mobile, preview, GitHub Pages)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// JSON parser for API routes
app.use(express.json({ limit: '2mb' }));

// Serve sitemap.xml explicitly
app.get(['/sitemap.xml', '/Warraich-Goods/sitemap.xml'], (_req, res) => {
  const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  const distPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.header('X-CDN-Status', 'Active');
  res.sendFile(publicPath, (err) => {
    if (err) res.sendFile(distPath);
  });
});

// Serve robots.txt explicitly
app.get(['/robots.txt', '/Warraich-Goods/robots.txt'], (_req, res) => {
  const publicPath = path.join(process.cwd(), 'public', 'robots.txt');
  const distPath = path.join(process.cwd(), 'dist', 'robots.txt');
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.header('X-CDN-Status', 'Active');
  res.sendFile(publicPath, (err) => {
    if (err) res.sendFile(distPath);
  });
});

// Serve Digital Asset Links for Android TWA verification
app.get(['/.well-known/assetlinks.json', '/Warraich-Goods/.well-known/assetlinks.json'], (_req, res) => {
  const publicPath = path.join(process.cwd(), 'public', '.well-known', 'assetlinks.json');
  const distPath = path.join(process.cwd(), 'dist', '.well-known', 'assetlinks.json');
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.header('X-CDN-Status', 'Active');
  res.sendFile(publicPath, (err) => {
    if (err) res.sendFile(distPath);
  });
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Driver Dost API Server'
  });
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1y',
      setHeaders: (res) => {
        res.setHeader('X-CDN-Status', 'Active');
        res.setHeader('CDN-Cache-Control', 'max-age=31536000');
      }
    }));
    app.get('*', (_req, res) => {
      res.setHeader('X-CDN-Status', 'Active');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Driver Dost Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
