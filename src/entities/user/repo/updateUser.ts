import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import User from '../User';

@ArgsType()
export class UpdateUserArgs {
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

/**
 * Returns the updated MEMBER, instead of the updated user so that React App
 * can more easily update it's global state with updated data.
 *
 * Invalidates GET_DIRECTORY and GET_USER calls.
 */
const updateUser = async (
  args: UpdateUserArgs,
  { communityId, userId }: GQLContext
): Promise<User> => {
  return new BloomManager().findOneAndUpdate(
    User,
    { id: userId },
    { ...args },
    {
      cacheKeysToInvalidate: [
        ...(args.firstName || args.lastName || args.pictureUrl
          ? [`${QueryEvent.GET_DIRECTORY}-${communityId}`]
          : []),
        `${QueryEvent.GET_USER}-${userId}`
      ],
      event: 'UPDATE_USER'
    }
  );
};

export default updateUser;
