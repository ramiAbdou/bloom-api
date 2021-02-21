import BloomManager from '@core/db/BloomManager';
import User from '@entities/user/User';
import { EmailsContext } from '../emails.types';

export interface LoginLinkEmailContext {
  email: string;
  loginUrl: string;
}

export interface LoginLinkEmailVars {
  loginUrl: string;
  user: User;
}

const prepareLoginLinkVars = async (
  context: EmailsContext
): Promise<LoginLinkEmailVars[]> => {
  const { email, loginUrl } = context as LoginLinkEmailContext;
  const user: User = await new BloomManager().findOne(User, { email });
  const variables: LoginLinkEmailVars[] = [{ loginUrl, user }];
  return variables;
};

export default prepareLoginLinkVars;
