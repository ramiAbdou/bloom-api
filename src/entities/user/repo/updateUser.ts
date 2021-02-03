import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../../member/Member';

@ArgsType()
export class UpdateUserArgs {
  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  pictureUrl?: string;
}

/**
 * Returns the updated MEMBER, instead of the updated user so that React App
 * can more easily update it's global state with updated data.
 *
 * Invalidates GET_DIRECTORY and GET_USER calls.
 *
 * @param args.bio Bio of the member.
 * @param args.firstName First name of the user.
 * @param args.lastName Last name of the member.
 * @param args.pictureUrl Picture URL of the user.
 */
const updateUser = async (
  { bio, firstName, lastName, pictureUrl }: UpdateUserArgs,
  { communityId, memberId, userId }: GQLContext
): Promise<Member> => {
  const bm = new BloomManager();

  const member: Member = await bm.findOne(
    Member,
    { id: memberId },
    { populate: ['user'] }
  );

  member.bio = bio;
  member.user.firstName = firstName;
  member.user.lastName = lastName;
  member.user.pictureUrl = pictureUrl;

  await bm.flush({
    cacheKeysToInvalidate: [
      `${QueryEvent.GET_DIRECTORY}-${communityId}`,
      `${QueryEvent.GET_USER}-${userId}`
    ],
    event: 'UPDATE_USER'
  });

  return member;
};

export default updateUser;
