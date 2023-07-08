import fs from 'fs';
import ejs from 'ejs';

class ForgotPasswordTemplate {
  public passwordResetTemplate(username: string, resetLink: string): string {
    return ejs.render(
      fs.readFileSync(__dirname + '/forgot-password-template.ejs', 'utf-8'),
      {
        username,
        resetLink,
        image_url:
          'https://w7.pngwing.com/pngs/715/372/png-transparent-two-checked-flags-racing-flags-auto-racing-racing-flag-miscellaneous-game-flag-png-free-download-thumbnail.png',
      }
    );
  }
}

export const forgotPasswordTemplate: ForgotPasswordTemplate =
  new ForgotPasswordTemplate();
