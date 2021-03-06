import { ArgsType, Field } from 'type-graphql';

import { LoginLinkEmailPayload } from '@system/emails/repo/getLoginLinkVars';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import { APP } from '@util/constants';
import { ErrorType } from '@util/constants.errors';
import { EmailEvent } from '@util/constants.events';
import { buildUrl } from '@util/util';
import getLoginError from './getLoginError';
import refreshToken from './refreshToken';

@ArgsType()
export class SendLoginLinkArgs {
  @Field({ nullable: true })
  communityId?: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  pathname?: string;
}

/**
 * Generates a temporary login URL with token for the User with the given email.
 * Runs the refresh flow for the user.
 */
const sendLoginLink = async (args: SendLoginLinkArgs): Promise<void> => {
  const { communityId, email, pathname } = args;

  // If the User hasn't been accepted into any community, throw an error.
  const loginError: ErrorType = await getLoginError({ communityId, email });
  if (loginError) throw new Error(loginError);

  // Otherwise, run the refresh flow and get the temporary token to store in
  // the login URL.
  const { accessToken: token } = await refreshToken({ email });

  const loginUrl: string = buildUrl({
    params: { token },
    url: APP.CLIENT_URL + (pathname ?? '')
  });

  emitEmailEvent(EmailEvent.LOGIN_LINK, {
    email,
    loginUrl
  } as LoginLinkEmailPayload);
};

export default sendLoginLink;
