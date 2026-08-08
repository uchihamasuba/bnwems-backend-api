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

// Error handling
app.use(errorMiddleware);

export default app;
