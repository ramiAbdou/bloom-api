import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import User from '../User';

@ArgsType()
export class UpdateUserSocialsArgs {
  @Field({ nullable: true })
  facebookUrl?: string;

  @Field({ nullable: true })
  instagramUrl?: string;

  @Field({ nullable: true })
  linkedInUrl?: string;

  @Field({ nullable: true })
  twitterUrl?: string;
}

/**
 * Returns the updated user with updated socials.
 *
 * Invalidates GET_DIRECTORY and GET_USER calls.
 *
 * @param args.facebookUrl Facebook URL of the user.
 * @param args.instagramUrl Instagram URL of the user.
 * @param args.linkedInUrl LinkedIn URL of the user.
 * @param args.twitterUrl Twitter URL of the user.
 */
const updateUserSocials = async (
  { facebookUrl, instagramUrl, linkedInUrl, twitterUrl }: UpdateUserSocialsArgs,
  { userId }: GQLContext
): Promise<User> => {
  return new BloomManager().findOneAndUpdate(
    User,
    { id: userId },
    { facebookUrl, instagramUrl, linkedInUrl, twitterUrl },
    {
      cacheKeysToInvalidate: [`${QueryEvent.GET_USER}-${userId}`],
      event: 'UPDATE_USER_SOCIALS'
    }
  );
};

export default updateUserSocials;
