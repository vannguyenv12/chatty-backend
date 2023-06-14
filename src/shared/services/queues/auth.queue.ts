import { IAuthJob } from '@auth/interfaces/auth.inteface';
import { BaseQueue } from './base.queue';
import { authWoker } from '@worker/auth.worker';

class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob('addAuthUserToDB', 5, authWoker.addAuthUserToDB);
  }

  public addAuthUserJob(name: string, data: IAuthJob): void {
    this.addJob(name, data);
  }
}

export const authQueue: AuthQueue = new AuthQueue();
