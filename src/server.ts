import app from './app';
import { env } from './config/env';
import prisma from './config/database';

const PORT = env.PORT;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 BNWEMS Backend API is running on http://localhost:${PORT}`);
      console.log(`📚 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
