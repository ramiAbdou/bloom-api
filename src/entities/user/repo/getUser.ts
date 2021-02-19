import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import User from '../User';

@ArgsType()
export class GetUserArgs {
  @Field({ nullable: true })
  userId?: string;
}

const getUser = async (
  args: GetUserArgs,
  ctx: Pick<GQLContext, 'userId'>
): Promise<User> => {
  const userId = args?.userId ?? ctx.userId;

  const user: User = await new BloomManager().findOneOrFail(
    User,
    { id: userId },
    { cacheKey: `${QueryEvent.GET_USER}-${userId}` }
  );

  return user;
};

export default getUser;
