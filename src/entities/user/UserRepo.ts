/**
 * @fileoverview Repository: User
 * @author Rami Abdou
 */

import { EntityRepository } from 'mikro-orm';

import { APP } from '@constants';
import { sendEmail, VERIFICATION_EMAIL_ARGS } from '@util/emails';
import { ValidateEmailData } from '@util/emails/types';
import User from './User';

export default class UserRepo extends EntityRepository<User> {
  /**
   * Sends the user a verification email to verify their email address. This
   * will only be triggered if a user manually requests the email to be sent
   * (again).
   */
  async sendVerificationEmail(userId: string) {
    const { email, id }: User = await this.findOne({ id: userId });
    await sendEmail({
      ...VERIFICATION_EMAIL_ARGS,
      to: email,
      verificationUrl: `${APP.SERVER_URL}/users/${id}/verify`
    } as ValidateEmailData);
  }
}
