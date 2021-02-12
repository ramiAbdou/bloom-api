import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { PopulateArgs } from '@util/gql.types';
import User from '../User';

@ArgsType()
export class GetUserArgs extends PopulateArgs {
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
    {
      cacheKey: `${QueryEvent.GET_USER}-${userId}`,
      populate: args?.populate
    }
  );

  return user;
};

export default getUser;
