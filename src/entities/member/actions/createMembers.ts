import { ArgsType, Field, InputType } from 'type-graphql';

import { Event, GQLContext } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import Community from '../../community/Community';
import Member from '../Member';

@InputType()
export class NewMemberInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => Boolean)
  isAdmin: boolean;
}

@ArgsType()
export class CreateMembersArgs {
  @Field(() => [NewMemberInput])
  members: NewMemberInput[];
}

/**
 * Toggles the admin status of the member. If the role of the members
 * were previously ADMIN, they become null, and vice versa.
 */
export default async (
  { members: inputs }: CreateMembersArgs,
  { communityId }: GQLContext
): Promise<Member[]> => {
  const bm = new BloomManager();
  const communityIntegrationsRepo = bm.communityIntegrationsRepo();
  const memberRepo = bm.memberRepo();

  const community: Community = await bm
    .communityRepo()
    .findOne({ id: communityId }, ['integrations', 'types']);

  const existingMembers: Member[] = await bm.memberRepo().find({
    community,
    user: { email: inputs.map(({ email }) => email.toLowerCase()) }
  });

  if (existingMembers.length) {
    throw new Error(
      'At least 1 of these emails already exists in this community.'
    );
  }

  const members: Member[] = await Promise.all(
    inputs.map(async ({ isAdmin, email, firstName, lastName }) =>
      bm.memberRepo().createAndPersist({
        community,
        role: isAdmin ? 'ADMIN' : null,
        status: 'INVITED',
        // The user can potentially already exist if they are a part of other
        // communities.
        user:
          (await bm.userRepo().findOne({ email })) ??
          bm.userRepo().createAndPersist({ email, firstName, lastName })
      })
    )
  );

  await memberRepo.flush('MEMBERSHIPS_CREATED', members);
  cache.invalidateEntries([`${Event.GET_MEMBERS}-${communityId}`], true);

  await bm.em.populate(members, ['community.questions', 'data']);

  // Send the appropriate emails based on the response. Also, add the members
  // to the Mailchimp audience.
  setTimeout(async () => {
    await communityIntegrationsRepo.addToMailchimpAudience(members, community);
  }, 0);

  return members;
};
