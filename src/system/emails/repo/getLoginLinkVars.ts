import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';
import { EmailPayload } from '../emails.types';

export interface LoginLinkEmailPayload {
  email: string;
  loginUrl: string;
}

export interface LoginLinkEmailVars {
  loginUrl: string;
  member: Pick<Member, 'email' | 'firstName'>;
}

const getLoginLinkVars = async (
  context: EmailPayload
): Promise<LoginLinkEmailVars[]> => {
  const { email, loginUrl } = context as LoginLinkEmailPayload;

  const member: Member = await new BloomManager().em.findOne(
    Member,
    { email },
    { fields: ['email', 'firstName'] }
  );

  const variables: LoginLinkEmailVars[] = [{ loginUrl, member }];
  return variables;
};

export default getLoginLinkVars;
