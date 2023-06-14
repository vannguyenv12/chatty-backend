import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { NotAuthorizeError } from './error-handler';
import { AuthPayload } from '@auth/interfaces/auth.inteface';
import { config } from '@root/config';

class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizeError('Token is not available. Please login again');
    }

    try {
      const payload: AuthPayload = JWT.verify(
        req.session?.jwt,
        config.JWT_TOKEN!
      ) as AuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizeError('Token is invalid. Please login again');
    }
    next();
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction) {
    if (!req.currentUser) {
      throw new NotAuthorizeError('Authentication is required for this route');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
