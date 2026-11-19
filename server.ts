import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.disable('x-powered-by');

// Parse port and host from CLI args (--port, --host) or environment
let port = Number(process.env.PORT) || 3000;
const portArgIndex = process.argv.indexOf('--port');
if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
  const parsed = Number(process.argv[portArgIndex + 1]);
  if (!isNaN(parsed) && parsed > 0) port = parsed;
}

let host = '0.0.0.0';
const hostArgIndex = process.argv.indexOf('--host');
if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
  host = process.argv[hostArgIndex + 1];
}

// Security & CORS middleware for cross-origin client requests (PWA, mobile, preview, GitHub Pages)
const ALLOWED_CORS_ORIGINS = new Set(
  [
    'https://zahdan-443.github.io',
    'capacitor://localhost',
    'https://localhost',
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : [])
  ].filter(Boolean)
);

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_CORS_ORIGINS.has(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.run\.app$/i.test(origin)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;
  return false;
}

app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  if (origin && isAllowedOrigin(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(origin && !isAllowedOrigin(origin) ? 403 : 200);
  }
  next();
});

// Lightweight per-IP rate limiter for /api/* proxy endpoints
const apiRateMap = new Map<string, { count: number; resetAt: number }>();
const API_RATE_WINDOW_MS = 60 * 1000;
const API_RATE_MAX = 60;

app.use('/api', (req, res, next) => {
  const clientIp = (req.ip || req.socket?.remoteAddress || 'unknown').toString();
  const now = Date.now();
  let bucket = apiRateMap.get(clientIp);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + API_RATE_WINDOW_MS };
    if (apiRateMap.size >= 2000) {
      const oldestKey = apiRateMap.keys().next().value;
      if (oldestKey !== undefined) apiRateMap.delete(oldestKey);
    }
    apiRateMap.set(clientIp, bucket);
  }
  bucket.count += 1;
  if (bucket.count > API_RATE_MAX) {
    return res.status(429).json({ error: 'Too many requests, please retry shortly.' });
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

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Driver Dost API Server'
  });
});

// Weather API Proxy Endpoint (Server-Side Proxy with bounded LRU/FIFO in-memory cache)
const weatherCache = new Map<string, { timestamp: number; data: unknown }>();
const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const WEATHER_CACHE_MAX_ENTRIES = 500;

function setWeatherCache(key: string, data: unknown): void {
  const now = Date.now();
  if (weatherCache.has(key)) {
    weatherCache.delete(key);
  }
  weatherCache.set(key, { timestamp: now, data });
  if (weatherCache.size > WEATHER_CACHE_MAX_ENTRIES) {
    for (const [k, entry] of weatherCache.entries()) {
      if (now - entry.timestamp >= WEATHER_CACHE_TTL) {
        weatherCache.delete(k);
      }
      if (weatherCache.size <= WEATHER_CACHE_MAX_ENTRIES) break;
    }
    while (weatherCache.size > WEATHER_CACHE_MAX_ENTRIES) {
      const oldest = weatherCache.keys().next().value;
      if (oldest === undefined) break;
      weatherCache.delete(oldest);
    }
  }
}

app.get('/api/weather', async (req, res) => {
  const lat = Number(req.query.latitude);
  const lon = Number(req.query.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ error: 'Valid numeric latitude and longitude required' });
  }

  const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility',
      hourly: 'precipitation_probability',
      forecast_days: '1',
      timezone: 'Asia/Karachi'
    });
    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const apiRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!apiRes.ok) {
      throw new Error(`Open-Meteo returned status ${apiRes.status}`);
    }

    const data: unknown = await apiRes.json();
    setWeatherCache(cacheKey, data);
    return res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Weather proxy fetch error:', message);
    if (cached) {
      return res.json(cached.data);
    }
    return res.status(502).json({ error: 'Weather upstream unavailable' });
  }
});

// Pakistan Fuel Prices Proxy Endpoint (Official PSO POL Archives with 30-min cache)
let fuelProxyCache: { timestamp: number; data: Record<string, unknown> } | null = null;
const FUEL_PROXY_TTL = 30 * 60 * 1000;

app.get('/api/fuel-prices', async (_req, res) => {
  if (fuelProxyCache && Date.now() - fuelProxyCache.timestamp < FUEL_PROXY_TTL) {
    return res.json(fuelProxyCache.data);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const psoRes = await fetch('https://psopk.com/fuel-prices/pol/archives', {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (psoRes.ok) {
      const html = await psoRes.text();
      const firstBlockMatch = html.match(/Effective From:\s*([^<\n]+)[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i);
      if (firstBlockMatch) {
        const effectiveDate = firstBlockMatch[1].trim();
        const tbody = firstBlockMatch[2];
        const extractRate = (pattern: RegExp) => {
          const m = tbody.match(pattern);
          return m ? Number(m[1]).toFixed(2) : '';
        };
        const petrol = extractRate(/PREMIER EURO 5[\s\S]*?Rs\.([0-9.]+)/i);
        const diesel = extractRate(/HI-CETANE DIESEL EURO 5[\s\S]*?Rs\.([0-9.]+)/i);
        const ldo = extractRate(/<td>\s*LDO\s*<\/td>[\s\S]*?Rs\.([0-9.]+)/i);
        const kerosene = extractRate(/<td>\s*SKO\s*<\/td>[\s\S]*?Rs\.([0-9.]+)/i);
        if (diesel && petrol) {
          const payload = {
            diesel,
            petrol,
            ldo: ldo || undefined,
            kerosene: kerosene || undefined,
            effectiveDate,
            source: 'PSO POL Archives (psopk.com)'
          };
          fuelProxyCache = { timestamp: Date.now(), data: payload };
          return res.json(payload);
        }
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('PSO archive proxy notice:', message);
  }

  if (fuelProxyCache) {
    return res.json(fuelProxyCache.data);
  }
  return res.status(502).json({ error: 'PSO upstream unavailable' });
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
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

  const server = app.listen(port, host, () => {
    console.log(`Driver Dost Server running on http://${host}:${port}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is currently in use, process will exit cleanly.`);
      process.exit(0);
    } else {
      console.error('Server error:', err);
    }
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start Driver Dost server:', err);
  process.exit(1);
});
