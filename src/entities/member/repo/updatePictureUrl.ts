import BloomManager from '@core/db/BloomManager';
import Member from '@entities/member/Member';

interface UpdatePictureUrlArgs {
  email: string;
  pictureUrl: string;
}

/**
 * Returns the updated Member(s). If the Member didn't have a pictureUrl
 * previously, we set the pictureUrl.
 *
 * NOTE: This is only meant for setting profile pictures from OAuth2 logins
 * (ie: Google).
 *
 * @param args.email - Email of the Member(s).
 * @param args.pictureUrl - Picture URL to update on the Member(s).
 */
const updatePictureUrl = async (
  args: UpdatePictureUrlArgs
): Promise<Member[]> => {
  const { email, pictureUrl } = args;

  const members: Member[] = await new BloomManager().findAndUpdate(
    Member,
    { email, pictureUrl: null },
    { pictureUrl }
  );

  return members;
};

export default updatePictureUrl;
