import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';
import refreshToken from '@entities/user/repo/refreshToken';
import { APP } from '@util/constants';
import { VerifyEvent } from '@util/constants.events';
import { buildUrl } from '@util/util';
import { EmailPayload } from '../emails.types';

export interface LoginLinkEmailPayload {
  email: string;
  redirectUrl: string;
}

export interface LoginLinkEmailVars {
  loginUrl: string;
  member: Pick<Member, 'email' | 'firstName'>;
}

const getLoginLinkVars = async (
  context: EmailPayload
): Promise<LoginLinkEmailVars[]> => {
  const { email, redirectUrl } = context as LoginLinkEmailPayload;

  // Otherwise, run the refresh flow and get the temporary token to store in
  // the login URL.
  const accessToken: string = await refreshToken(
    { email },
    { tokenPayload: { event: VerifyEvent.LOG_IN } }
  );

  const loginUrl: string = buildUrl({
    params: { token: accessToken },
    url: APP.CLIENT_URL + (redirectUrl ?? '')
  });

  const member: Member = await new BloomManager().em.findOne(
    Member,
    { email },
    { fields: ['email', 'firstName'] }
  );

  const variables: LoginLinkEmailVars[] = [{ loginUrl, member }];
  return variables;
};

export default getLoginLinkVars;
