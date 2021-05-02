import { findOne } from '@core/db/db.util';
import Member from '@entities/member/Member';
import User from '@entities/user/User';
import { APP } from '@util/constants';
import { VerifyEvent } from '@util/constants.events';
import { buildUrl, signToken } from '@util/util';
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

  const [member, user]: [Member, User] = await Promise.all([
    findOne(Member, { email }),
    findOne(User, { email })
  ]);

  // Otherwise, run the refresh flow and get the temporary token to store in
  // the login URL.
  const loginToken: string = signToken({
    expires: false,
    payload: { event: VerifyEvent.LOGIN, userId: user.id }
  });

  const loginUrl: string = buildUrl({
    params: { token: loginToken },
    url: APP.CLIENT_URL + (redirectUrl ?? '')
  });

  const variables: LoginLinkEmailVars[] = [
    { loginUrl, member: { email: member.email, firstName: member.firstName } }
  ];

  return variables;
};

export default getLoginLinkVars;
