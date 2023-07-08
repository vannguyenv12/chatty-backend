import { IAuthDocument } from '@auth/interfaces/auth.inteface';
import { emailSchema, passwordSchema } from '@auth/schemas/password';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { BadRequestError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import crypto from 'crypto';
import { config } from '@root/config';
import { forgotPasswordTemplate } from '@service/emails/templates/fogot-password/forgot-password';
import { emailQueue } from '@service/queues/email.queue';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import moment from 'moment';
import publicIp from 'ip';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password';

export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(
      email
    );

    if (!existingUser) {
      throw new BadRequestError('Invalid Credentials!');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');

    await authService.updatePasswordToken(
      `${existingUser._id}`,
      randomCharacters,
      Date.now() * 60 * 60 * 1000 // 1 hours
    );

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(
      existingUser.username,
      resetLink
    );
    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: email,
      subject: 'Reset your password',
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Password Reset Email Sent!' });
  }

  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    if (password != confirmPassword) {
      throw new BadRequestError('Password does not matches');
    }
    const { token } = req.params;

    const existingUser: IAuthDocument =
      await authService.getAuthUserByPasswordToken(token);

    if (!existingUser) {
      throw new BadRequestError('Reset token has expired!');
    }
    existingUser.password = password;
    existingUser.passwordResetExpires = undefined;
    existingUser.passwordResetToken = undefined;
    await existingUser.save();

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicIp.address(),
      date: moment().format('DD/MM/YYYY HH:mm'),
    };

    const template: string =
      resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);

    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: existingUser.email,
      subject: 'Password Reset Confirmation',
    });

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Password Successfully Updated!' });
  }
}
