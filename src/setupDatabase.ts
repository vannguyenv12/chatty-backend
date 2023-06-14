import mongoose from 'mongoose';
import { config } from '@root/config';
import Logger from 'bunyan';
import { redisConnection } from '@service/redis/redis.connection';

const log: Logger = config.createLogger('setupDatabase');

export default () => {
  const connect = async () => {
    try {
      await mongoose.connect(`${config.DATABASE_URL}`);
      redisConnection.connect();
      log.info('connect to DB success');
    } catch (error) {
      log.error('connect DB error', error);
      return process.exit(1);
    }
  };

  connect();

  mongoose.connection.on('disconnected', connect);
};
