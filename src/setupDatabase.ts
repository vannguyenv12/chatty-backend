import mongoose from 'mongoose';
import { config } from './config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('setupDatabase');

export default () => {
  const connect = async () => {
    try {
      await mongoose.connect(`${config.DATABASE_URL}`);
      log.info('connect to DB success');
    } catch (error) {
      log.error('connect DB error', error);
      return process.exit(1);
    }
  };

  connect();

  mongoose.connection.on('disconnected', connect);
};
