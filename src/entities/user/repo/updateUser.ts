import { EntityData, FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import User from '@entities/user/User';

/**
 * Returns the updated User.
 *
 * @param args.where - Filter the User.
 * @param args.data - Data of the User to update.
 */
const updateUser = async (
  where: FilterQuery<User>,
  data: EntityData<User>
): Promise<User> => {
  const user: User = await new BloomManager().findOneAndUpdate(
    User,
    where,
    data
  );

  return user;
};

export default updateUser;
