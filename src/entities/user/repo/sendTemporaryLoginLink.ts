import { ArgsType, Field } from 'type-graphql';

import { APP } from '@constants';
import BloomManager from '@core/db/BloomManager';
import sendEmail from '@core/emails/sendEmail';
import { EmailTemplate, TemporaryLoginLinkVars } from '@core/emails/types';
import URLBuilder from '@util/URLBuilder';
import User from '../User';
import getLoginError, { LoginError } from './getLoginError';
import refreshToken from './refreshToken';

@ArgsType()
export class SendTemporaryLoginLinkArgs {
  @Field()
  email: string;
}

/**
 * Generates a temporary login URL with token for the User with the given email.
 * Runs the refresh flow for the user.
 */
const sendTemporaryLoginLink = async ({
  email
}: SendTemporaryLoginLinkArgs) => {
  const user: User = await new BloomManager().findOne(
    User,
    { email },
    { populate: ['members'] }
  );

  // If the User hasn't been accepted into any community, throw an error.
  const loginError: LoginError = await getLoginError(user);
  if (loginError) throw new Error(loginError);

  // Otherwise, run the refresh flow and get the temporary token to store in
  // the login URL.
  const { accessToken: token } = await refreshToken({ user });

  const loginUrl: string = new URLBuilder(APP.CLIENT_URL).addParam(
    'loginToken',
    token
  ).url;

  const emailOpts: TemporaryLoginLinkVars = {
    firstName: user.firstName,
    loginUrl
  };

  await sendEmail({
    template: EmailTemplate.TEMPORARY_LOGIN_LINK,
    to: email,
    variables: emailOpts
  });
};

export default sendTemporaryLoginLink;
