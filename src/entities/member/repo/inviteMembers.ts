import { InviteMembersPayload } from 'src/system/emails/util/getInviteMembersVars';
import { ArgsType, Field, InputType } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Community } from '@entities/entities';
import User from '@entities/user/User';
import { emitEmailEvent } from '@system/eventBus';
import { EmailEvent, FlushEvent } from '@util/events';
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
 * @param {AddMemberInput[]} args.members
 * @param {string} args.members.email
 * @param {string} ctx.communityId
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
 * @param {AddMemberInput[]} args.members - Data for new members to create.
 * @param {string} args.members.email
 * @param {string} args.members.firstName
 * @param {string} args.members.lastName
 * @param {string} ctx.communityId
 */
const inviteMembers = async (
  args: InviteMembersArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Member[]> => {
  await assertInviteMembers(args, ctx);

  const { members: inputs } = args;
  const { communityId, memberId } = ctx;

  const bm = new BloomManager();

  const community = await bm.findOne(Community, { id: communityId });

  const members: Member[] = await Promise.all(
    inputs.map(async ({ isAdmin, email, firstName, lastName }) => {
      const [user] = await bm.findOneOrCreate(
        User,
        { email },
        { email, firstName, lastName }
      );

      return bm.create(Member, {
        community,
        role: isAdmin ? MemberRole.ADMIN : null,
        status: MemberStatus.INVITED,
        type: community.defaultType.id,
        user
      });
    })
  );

  await bm.flush({ flushEvent: FlushEvent.ADD_MEMBERS });

  emitEmailEvent(EmailEvent.INVITE_MEMBERS, {
    communityId,
    coordinatorId: memberId,
    memberIds: members.map((member: Member) => member.id)
  } as InviteMembersPayload);

  return members;
};

export default inviteMembers;
