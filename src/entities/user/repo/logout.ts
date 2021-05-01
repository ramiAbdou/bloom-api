import { GQLContext } from '@util/constants';

/**
 * Clears all of the User's token cookies, effectively logging them out.
 *
 * @param ctx.res - Express Response object.
 */
const logout = ({ res }: Pick<GQLContext, 'res'>): boolean => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return true;
};

export default logout;
