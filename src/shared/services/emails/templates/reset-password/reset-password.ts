import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@user/interfaces/user.interface';

class ResetPasswordTemplate {
  public passwordResetConfirmationTemplate(
    templateParams: IResetPasswordParams
  ): string {
    const { username, email, ipaddress, date } = templateParams;
    return ejs.render(
      fs.readFileSync(__dirname + '/reset-password-template.ejs', 'utf-8'),
      {
        username,
        email,
        ipaddress,
        date,
        image_url:
          'https://w7.pngwing.com/pngs/715/372/png-transparent-two-checked-flags-racing-flags-auto-racing-racing-flag-miscellaneous-game-flag-png-free-download-thumbnail.png',
      }
    );
  }
}

export const resetPasswordTemplate: ResetPasswordTemplate =
  new ResetPasswordTemplate();
