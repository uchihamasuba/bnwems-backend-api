import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';

const app = express();

Object.defineProperty(BigInt.prototype, 'toJSON', {
  get() {
    return () => String(this);
  },
});

app.use(helmet());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Enable CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true, // Allow cookies if needed
  }),
);

// Serve static files from public/uploads
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

import { errorMiddleware } from './middlewares/error.middleware';

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/v1', routes);

// 404 Not Found handling
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.method} ${req.originalUrl}` 
  });
});

// Error handling
app.use(errorMiddleware);

export default app;
