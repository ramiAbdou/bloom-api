import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { FlushEvent } from '@util/events';
import User from '../User';

@ArgsType()
export class UpdateUserArgs {
  @Field({ nullable: true })
  clubhouseUrl?: string;

  @Field({ nullable: true })
  facebookUrl?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  instagramUrl?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  linkedInUrl?: string;

  @Field({ nullable: true })
  twitterUrl?: string;
}

const updateUser = async (
  args: UpdateUserArgs,
  { userId }: Pick<GQLContext, 'userId'>
): Promise<User> => {
  const user: User = await new BloomManager().findOneAndUpdate(
    User,
    { id: userId },
    { ...args },
    { flushEvent: FlushEvent.UPDATE_USER }
  );

  return user;
};

export default updateUser;
