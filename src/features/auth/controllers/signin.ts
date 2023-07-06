import { IAuthDocument } from '@auth/interfaces/auth.inteface';
import { loginSchema } from '@auth/schemas/signin';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { BadRequestError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import {
  IResetPasswordParams,
  IUserDocument,
} from '@user/interfaces/user.interface';
import { userService } from '@service/db/user.service';
import { mailTransport } from '@service/emails/mail.transport';
import { forgotPasswordTemplate } from '@service/emails/templates/fogot-password/forgot-password';
import { emailQueue } from '@service/queues/email.queue';
import moment from 'moment';
import publicIP from 'ip';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(
      username
    );

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const user: IUserDocument = await userService.getUserByAuthId(
      `${existingUser._id}`
    );

    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor,
      },
      config.JWT_TOKEN!
    );

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicIP.address(),
      date: moment().format('/DD/MM/YYYY HH:mm'),
    };

    const template: string =
      resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);

    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: 'susan.buckridge@ethereal.email',
      subject: 'Password Reset Confirm',
    });
    req.session = { jwt: userJwt };

    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!.id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt,
    } as IUserDocument;

    res.status(HTTP_STATUS.CREATED).json({
      message: 'User login successfully',
      user: userDocument,
      token: userJwt,
    });
  }
}
