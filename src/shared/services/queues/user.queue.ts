import { userWoker } from '@worker/user.worker';
import { BaseQueue } from './base.queue';

class UserQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob('addUserToDB', 5, userWoker.addUserToDB);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public addUserJob(name: string, data: any): void {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
