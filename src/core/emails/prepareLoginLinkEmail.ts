import User from '@entities/user/User';
import BloomManager from '../db/BloomManager';
import { FormatPersonalizationData } from './emails.types';
import formatPersonalizations from './formatPersonalizations';

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
): Promise<FormatPersonalizationData[]> => {
  const { email, loginUrl } = context;

  const user: User = await new BloomManager().findOne(User, { email });
  const variables: LoginLinkVars[] = [{ loginUrl, user }];

  return formatPersonalizations(variables);
};

export default prepareLoginLinkEmail;
