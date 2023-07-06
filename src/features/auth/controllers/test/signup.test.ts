import * as cloudinaryUpload from '@global/helpers/cloudinary-upload';
import {
  authMock,
  authMockRequest,
  authMockResponse,
} from '@root/mocks/auth.mock';
import { Request, Response } from 'express';
import { SignUp } from '../signup';
import { CustomError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { UserCache } from '@service/redis/user.cache';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/queues/user.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@global/helpers/cloudinary-upload');

describe('SignUp', () => {
  it('Should throw error if username is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'test1@gmail.com',
        password: 'test1234',
        avatarColor: 'red',
        avatarImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD',
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual(
        'Username is a required field'
      );
    });
  });

  it('Should throw error if username length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'sd',
        email: 'test1@gmail.com',
        password: 'test1234',
        avatarColor: 'red',
        avatarImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD',
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('Should throw unauthorize error if user already exist', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'sd',
        email: 'test1@gmail.com',
        password: 'test1234',
        avatarColor: 'red',
        avatarImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD',
      }
    ) as Request;

    const res: Response = authMockResponse();

    jest
      .spyOn(authService, 'getUserbyUsernameOrEmail')
      .mockResolvedValue(authMock);

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  // it('Should set session data for valid credentials and send correct json response', async () => {
  //   const req: Request = authMockRequest(
  //     {},
  //     {
  //       username: 'hellotheworld',
  //       email: 'test1@gmail.com',
  //       password: 'test1234',
  //       avatarColor: 'red',
  //       avatarImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD',
  //     }
  //   ) as Request;

  //   const res: Response = authMockResponse();

  //   jest
  //     .spyOn(authService, 'getUserbyUsernameOrEmail')
  //     .mockResolvedValue(null as any);

  //   const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
  //   jest
  //     .spyOn(cloudinaryUpload, 'upload')
  //     .mockImplementation((): any =>
  //       Promise.resolve({ version: '12345', public_id: '123456' })
  //     );

  //   await SignUp.prototype.create(req, res);

  //   expect(req.session?.token).toBeDefined();
  //   expect(res.json).toHaveBeenCalledWith({
  //     message: 'User created successfully!',
  //     user: userSpy.mock.calls[0][2],
  //     token: req.session?.jwt,
  //   });
  // });
});
