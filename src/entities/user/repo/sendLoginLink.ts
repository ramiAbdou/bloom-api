import { ArgsType, Field } from 'type-graphql';

import { APP } from '@constants';
import eventBus from '@core/eventBus';
import { EmailEvent, MiscEvent } from '@util/events';
import URLBuilder from '@util/URLBuilder';
import getLoginError, { LoginError } from './getLoginError';
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
const sendLoginLink = async ({
  communityId,
  email,
  pathname
}: SendLoginLinkArgs) => {
  // If the User hasn't been accepted into any community, throw an error.
  const loginError: LoginError = await getLoginError({ communityId, email });
  if (loginError) throw new Error(loginError);

  // Otherwise, run the refresh flow and get the temporary token to store in
  // the login URL.
  const { accessToken: token } = await refreshToken({ email });

  const loginUrl: string = new URLBuilder(
    APP.CLIENT_URL + (pathname ?? '')
  ).addParam('token', token).url;

  eventBus.emit(MiscEvent.SEND_EMAIL, {
    context: { email, loginUrl },
    event: EmailEvent.LOGIN_LINK
  });
};

export default sendLoginLink;
