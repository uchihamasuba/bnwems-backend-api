import express from 'express';
import path from 'path';
import routes from './routes';

const app = express();

Object.defineProperty(BigInt.prototype, 'toJSON', {
  get() {
    return () => String(this);
  }
});

app.use(express.json());

// Serve static files from public/uploads
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

import { errorMiddleware } from './middlewares/error.middleware';

app.use('/api/v1', routes);

// Error handling
app.use(errorMiddleware);

export default app;