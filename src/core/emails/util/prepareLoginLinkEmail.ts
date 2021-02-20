import BloomManager from '@core/db/BloomManager';
import User from '@entities/user/User';

export interface LoginLinkContext {
  email: string;
  loginUrl: string;
}

export interface LoginLinkVars {
  loginUrl: string;
  user: User;
}

const prepareLoginLinkEmail = async (
  context: LoginLinkContext
): Promise<LoginLinkVars[]> => {
  const { email, loginUrl } = context;

  const user: User = await new BloomManager().findOne(User, { email });
  const variables: LoginLinkVars[] = [{ loginUrl, user }];

  return variables;
};

export default prepareLoginLinkEmail;
