import { APP } from '@constants';
import BloomManager from '@core/db/BloomManager';
import URLBuilder from '@util/URLBuilder';
import User from '../User';

/**
 * Generates a temporary loginToken based on the user. Runs the refresh
 * flow with the user.
 */
export default async (user: User) => {
  const bm = new BloomManager();
  const { accessToken: token } = await bm.refreshTokenFlow({ user });
  return new URLBuilder(APP.CLIENT_URL).addParam('loginToken', token).url;
};
