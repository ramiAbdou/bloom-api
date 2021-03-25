import { ArgsType, Field, InputType } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import MemberIntegrations from '@entities/member-integrations/MemberIntegrations';
import MemberSocials from '@entities/member-socials/MemberSocials';
import User from '@entities/user/User';
import { InviteMembersPayload } from '@system/emails/repo/getInviteMembersVars';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import { GQLContext } from '@util/constants';
import { EmailEvent, FlushEvent } from '@util/constants.events';
import Member, { MemberRole, MemberStatus } from '../Member';

@InputType()
class InviteMemberInput {
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
export class InviteMembersArgs {
  @Field(() => [InviteMemberInput])
  members: InviteMemberInput[];
}

/**
 * Throws error if one member has an email that already exists.
 *
 * @param args.members.email
 * @param ctx.communityId
 */
const assertInviteMembers = async (
  args: InviteMembersArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<void> => {
  const { members: inputs } = args;
  const { communityId } = ctx;

  const bm = new BloomManager();

  const existingMembers: Member[] = await bm.find(Member, {
    community: communityId,
    user: { email: inputs.map(({ email }) => email.toLowerCase()) }
  });

  if (existingMembers.length) {
    throw new Error(
      'At least 1 of these emails already exists in this community.'
    );
  }
};

/**
 * Creates new Members (and maybe Users) based on the data given.
 * Precondition: Only members who are admins can call this function.
 *
 * @param args.members - Data for new members to create.
 * @param args.members.email
 * @param args.members.firstName
 * @param args.members.lastName
 * @param ctx.communityId
 */
const inviteMembers = async (
  args: InviteMembersArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Member[]> => {
  await assertInviteMembers(args, ctx);

  const { members: inputs } = args;
  const { communityId, memberId } = ctx;

  const bm = new BloomManager();

  const community = await bm.findOne(Community, communityId);

  const members: Member[] = await Promise.all(
    inputs.map(async ({ isAdmin, email, firstName, lastName }) => {
      const [user] = await bm.findOneOrCreate(User, { email }, { email });

      return bm.create(Member, {
        community,
        email,
        firstName,
        lastName,
        memberIntegrations: bm.create(MemberIntegrations, {}),
        plan: community.defaultType.id,
        role: isAdmin ? MemberRole.ADMIN : null,
        socials: bm.create(MemberSocials, {}),
        status: MemberStatus.INVITED,
        user
      });
    })
  );

  await bm.flush({ flushEvent: FlushEvent.INVITE_MEMBERS });

  emitEmailEvent(EmailEvent.INVITE_MEMBERS, {
    communityId,
    coordinatorId: memberId,
    memberIds: members.map((member: Member) => member.id)
  } as InviteMembersPayload);

  return members;
};

export default inviteMembers;
