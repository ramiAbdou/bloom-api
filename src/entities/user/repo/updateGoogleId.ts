import BloomManager from '@core/db/BloomManager';
import User from '@entities/user/User';
import { FlushEvent } from '@util/constants.events';

interface UpdateGoogleIdArgs {
  email: string;
  googleId: string;
}

/**
 * Returns the updated User with a googleId attached. If the User already
 * has a googleId attached, just returns the existing User.
 *
 * @param args.email - Email of the User.
 * @param args.googleId - ID of the Google Profile.
 */
const updateGoogleId = async (args: UpdateGoogleIdArgs): Promise<User> => {
  const { email, googleId } = args;

  const user: User = await new BloomManager().findOneAndUpdate(
    User,
    { email },
    { googleId },
    { flushEvent: FlushEvent.UPDATE_GOOGLE_ID }
  );

  return user;
};

export default updateGoogleId;