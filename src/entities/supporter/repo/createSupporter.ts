import BloomManager from '@core/db/BloomManager';
import Supporter from '@entities/supporter/Supporter';
import User from '@entities/user/User';

interface CreateSupporterArgs {
  communityId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  supporterId?: string;
}

/**
 * Returns a new Supporter. If the Supporter already exists, just return
 * the existing Supporter.
 *
 * @param args.communityId - ID of the Community to create Supporter for.
 * @param args.email - Email of the Supporter.
 * @param args.firstName - First name of the Supporter.
 * @param args.lastName - Last name of the Supporter.
 * @param args.supporterId - ID of the potentially existing Supporter.
 */
const createSupporter = async ({
  communityId,
  email,
  firstName,
  lastName,
  supporterId
}: CreateSupporterArgs): Promise<Supporter> => {
  const bm: BloomManager = new BloomManager();

  if (supporterId) return bm.findOne(Supporter, { id: supporterId });

  const [user]: [User, boolean] = await bm.findOneOrCreate(
    User,
    { email },
    { email }
  );

  const [supporter]: [Supporter, boolean] = await bm.findOneOrCreate(
    Supporter,
    { community: communityId, email },
    { community: communityId, email, firstName, lastName, user }
  );

  await bm.flush();

  return supporter;
};

export default createSupporter;
