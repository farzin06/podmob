import dotenv from 'dotenv';
import { createApp } from './app.js';
import { db } from './config/db.js';
import { FeedSyncScheduler } from './services/feedSyncScheduler.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 5001;

async function bootstrap() {
  try {
    // Initialize database (MySQL with automatic fallback)
    await db.init();

    // Start background RSS sync scheduler (runs every 20 minutes)
    FeedSyncScheduler.init();

    const app = createApp();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`=========================================`);
      console.log(`🚀 PodMob Backend Server is running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🔌 API Base: http://localhost:${PORT}/api`);
      console.log(`🗄️ Database: ${db.isMySQL ? 'MySQL' : 'SQLite'}`);
      console.log(`=========================================`);
    });

    const shutdown = async () => {
      console.log('Shutting down server...');
      FeedSyncScheduler.stop();
      server.close(async () => {
        await db.close();
        console.log('Server closed successfully.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Fatal bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();
