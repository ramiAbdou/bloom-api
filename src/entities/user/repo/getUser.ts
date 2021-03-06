import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import User from '../User';

@ArgsType()
export class GetUserArgs {
  @Field({ nullable: true })
  userId?: string;
}

/**
 * Returns the User.
 *
 * @param args.userId - ID of the User.
 * @param ctx.userId - ID of the User (authenticated).
 */
const getUser = async (
  args: GetUserArgs,
  ctx: Pick<GQLContext, 'userId'>
): Promise<User> => {
  const userId = args.userId ?? ctx.userId;

  const user: User = await new BloomManager().findOneOrFail(User, userId, {
    cacheKey: `${QueryEvent.GET_USER}-${userId}`
  });

  return user;
};

export default getUser;
