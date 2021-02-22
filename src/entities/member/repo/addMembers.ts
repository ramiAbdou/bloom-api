import { ArgsType, Field, InputType } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import User from '@entities/user/User';
import { FlushEvent } from '@util/events';
import Member, { MemberStatus } from '../Member';

@InputType()
class AddMemberInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => Boolean, { defaultValue: false })
  isAdmin?: boolean;
}

@ArgsType()
export class AddMembersArgs {
  @Field(() => [AddMemberInput])
  members: AddMemberInput[];
}

/**
 * Toggles the admin status of the member. If the role of the members
 * were previously ADMIN, they become null, and vice versa.
 */
const addMembers = async (
  { members: inputs }: AddMembersArgs,
  { communityId }: GQLContext
): Promise<Member[]> => {
  const bm = new BloomManager();
  const community = await bm.findOne(Community, { id: communityId });

  const existingMembers: Member[] = await bm.find(Member, {
    community,
    user: { email: inputs.map(({ email }) => email.toLowerCase()) }
  });

  if (existingMembers.length) {
    throw new Error(
      'At least 1 of these emails already exists in this community.'
    );
  }

  const members: Member[] = await Promise.all(
    inputs.map(async ({ isAdmin, email, firstName, lastName }) => {
      return bm.create(Member, {
        community,
        role: isAdmin ? 'ADMIN' : null,
        status: MemberStatus.INVITED,
        // The user can potentially already exist if they are a part of other
        // communities.
        user:
          (await bm.findOne(User, { email })) ??
          bm.create(User, { email, firstName, lastName })
      });
    })
  );

  await bm.flush({ flushEvent: FlushEvent.ADD_MEMBERS });

  return members;
};

export default addMembers;
