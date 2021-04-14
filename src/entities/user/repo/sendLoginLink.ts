import { ArgsType, Field, ObjectType } from 'type-graphql';

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
  redirectUrl?: string;
}

@ObjectType()
export class SendLoginLinkResult {
  @Field()
  ok: boolean;
}

/**
 * Generates a temporary login URL with token for the User with the given email.
 * Runs the refresh flow for the user.
 */
const sendLoginLink = async ({
  communityId,
  email,
  redirectUrl
}: SendLoginLinkArgs): Promise<SendLoginLinkResult> => {
  // If the User hasn't been accepted into any community, throw an error.
  const loginError: ErrorType = await getLoginError({ communityId, email });
  if (loginError) throw new Error(loginError);

  // Otherwise, run the refresh flow and get the temporary token to store in
  // the login URL.
  const accessToken: string = await refreshToken({ email });

  const loginUrl: string = buildUrl({
    params: { token: accessToken },
    url: APP.CLIENT_URL + (redirectUrl ?? '')
  });

  emitEmailEvent(EmailEvent.LOGIN_LINK, {
    email,
    loginUrl
  } as LoginLinkEmailPayload);

  return { ok: true };
};

export default sendLoginLink;
