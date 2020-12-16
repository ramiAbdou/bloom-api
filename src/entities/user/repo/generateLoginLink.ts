import { APP } from '@constants';
import URLBuilder from '@util/URLBuilder';
import User from '../User';
import refreshToken from './refreshToken';

/**
 * Generates a temporary loginToken based on the user. Runs the refresh
 * flow with the user.
 */
export default async (user: User) => {
  const { accessToken: token } = await refreshToken({ user });
  return new URLBuilder(APP.CLIENT_URL).addParam('loginToken', token).url;
};
