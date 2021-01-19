import { ArgsType, Field, ObjectType } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../../member/Member';
import User from '../User';

@ArgsType()
export class UpdateUserArgs {
  @Field({ nullable: true })
  bio?: string;

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

@ObjectType()
export class UpdateUserResult {
  @Field(() => Member)
  member: Member;

  @Field(() => User)
  user: User;
}

const updateUser = async (
  {
    bio,
    facebookUrl,
    firstName,
    instagramUrl,
    lastName,
    linkedInUrl,
    pictureUrl,
    twitterUrl
  }: UpdateUserArgs,
  { communityId, memberId, userId }: GQLContext
): Promise<UpdateUserResult> => {
  const bm = new BloomManager();

  const [user, member]: [User, Member] = await Promise.all([
    bm.findOne(User, { id: userId }),
    bm.findOne(Member, { id: memberId })
  ]);

  if (bio) member.bio = bio;

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;

  if (facebookUrl) user.facebookUrl = facebookUrl;
  if (instagramUrl) user.instagramUrl = instagramUrl;
  if (linkedInUrl) user.linkedInUrl = linkedInUrl;
  if (pictureUrl) user.pictureUrl = pictureUrl;
  if (twitterUrl) user.twitterUrl = twitterUrl;

  await bm.flush({
    cacheKeysToInvalidate: [
      `${QueryEvent.GET_DIRECTORY}-${communityId}`,
      `${QueryEvent.GET_USER}-${userId}`
    ],
    event: 'UPDATE_USER'
  });

  return { member, user };
};

export default updateUser;
