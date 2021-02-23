import BloomManager from '@core/db/BloomManager';
import User from '@entities/user/User';
import { EmailContext } from '../emails.types';

export interface LoginLinkEmailContext {
  email: string;
  loginUrl: string;
}

export interface LoginLinkEmailVars {
  loginUrl: string;
  user: Pick<User, 'email' | 'firstName'>;
}

const getLoginLinkVars = async (
  context: EmailContext
): Promise<LoginLinkEmailVars[]> => {
  const { email, loginUrl } = context as LoginLinkEmailContext;

  const user: User = await new BloomManager().findOne(
    User,
    { email },
    { fields: ['email', 'firstName'] }
  );

  const variables: LoginLinkEmailVars[] = [{ loginUrl, user }];
  return variables;
};

export default getLoginLinkVars;