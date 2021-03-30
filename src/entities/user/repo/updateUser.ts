import BloomManager from '@core/db/BloomManager';
import User from '@entities/user/User';
import { cleanObject } from '@util/util';

interface UpdateUserArgs {
  email: string;
  googleId?: string;
  refreshToken?: string;
}

/**
 * Returns the updated User with a googleId attached. If the User already
 * has a googleId attached, just returns the existing User.
 *
 * @param args.email - Email of the User.
 * @param args.googleId - ID of the Google Profile.
 * @param args.refreshToken - Refresh token of the User.
 */
const updateUser = async (args: UpdateUserArgs): Promise<User> => {
  const { email, googleId, refreshToken } = args;

  const user: User = await new BloomManager().findOneAndUpdate(
    User,
    { email },
    cleanObject({ googleId, refreshToken })
  );

  return user;
};

export default updateUser;
