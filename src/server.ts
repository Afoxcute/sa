import app from './index';
import { logger } from './utils';
import { connect } from 'mongoose';

const PORT = process.env.PORT || 4000;
const isLocal = process.env.NODE_ENV === 'development';
const dbURI = isLocal ? process.env.LOCAL_DATABASE_URL : process.env.DATABASE_URL;

const connectDB = async (): Promise<void> => {
  const connectionMessage: string = isLocal ? 'Local 🛠️🛠️' : 'Prod🌐🚀';
  try {
    await connect(dbURI);
    logger.info(`Connected to MongoDB ${connectionMessage}`);
  } catch (err: any) {
    logger.error(`Error connecting to mongodb ${err.message}`);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, (): void => {
    isLocal
      ? logger.info(`Local server running on http://localhost:${PORT}`)
      : logger.info(`Server running on prod`);
  });
});
