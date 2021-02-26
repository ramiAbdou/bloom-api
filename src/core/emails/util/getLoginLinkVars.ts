import BloomManager from '@core/db/BloomManager';
import User from '@entities/user/User';
import { EmailPayload } from '../emails.types';

export interface LoginLinkEmailPayload {
  email: string;
  loginUrl: string;
}

export interface LoginLinkEmailVars {
  loginUrl: string;
  user: Pick<User, 'email' | 'firstName'>;
}

const getLoginLinkVars = async (
  context: EmailPayload
): Promise<LoginLinkEmailVars[]> => {
  const { email, loginUrl } = context as LoginLinkEmailPayload;

  const user: User = await new BloomManager().findOne(
    User,
    { email },
    { fields: ['email', 'firstName'] }
  );

  const variables: LoginLinkEmailVars[] = [{ loginUrl, user }];
  return variables;
};

export default getLoginLinkVars;
