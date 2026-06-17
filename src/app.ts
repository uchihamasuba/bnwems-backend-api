import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import apiRoutes from './routes';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware';

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes under /api/v1
app.use('/api/v1', apiRoutes);

// 404 and error handlers — must be last
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
