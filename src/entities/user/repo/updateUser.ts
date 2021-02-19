import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
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
  pictureUrl?: string;

  @Field({ nullable: true })
  twitterUrl?: string;
}

const updateUser = async (
  args: UpdateUserArgs,
  { userId }: Pick<GQLContext, 'userId'>
): Promise<User> => {
  return new BloomManager().findOneAndUpdate(
    User,
    { id: userId },
    { ...args },
    { event: FlushEvent.UPDATE_USER }
  );
};

export default updateUser;
