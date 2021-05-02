import { findOne } from '@core/db/db.util';
import Member, { MemberStatus } from '@entities/member/Member';
import acceptInvitations from '@entities/member/repo/acceptInvitations';
import { ErrorType } from '@util/constants';
import User from '../User';

interface GetLoginErrorArgs {
  communityId: string;
  email: string;
}

/**
 * Returns an ErrorType if there is a login error. Otherwise, returns null.
 *
 * @param args.communityId - ID of the Community.
 * @param args.email - Email of the User to check status on.
 */
const getLoginError = async (args: GetLoginErrorArgs): Promise<ErrorType> => {
  const { communityId, email } = args;

  if (communityId) {
    // Check if the email is a member of this community.
    const member: Member = await findOne(Member, {
      community: communityId,
      email
    });

    if (!member) return ErrorType.NOT_MEMBER;
  }

  const user: User = await findOne(User, { email });

  if (!user) return ErrorType.USER_NOT_FOUND;

  const members: Member[] = await user.members.loadItems();

  if (!members.length) return ErrorType.NO_MEMBER_APPLICATIONS;

  // True if the User has >= 1 Member with status INVITED.
  const hasInvitedStatus: boolean = members.some((member: Member) => {
    return member.status === MemberStatus.INVITED;
  });

  // If when trying to login, the user has some a status of INVITED (only
  // possible if an admin added them manually), then we should set those
  // statuses to be ACCEPTED.
  if (hasInvitedStatus) {
    await acceptInvitations({ email });
    return null;
  }

  // True if the User has >= 1 Member with status ACCEPTED.
  const hasAcceptedStatus: boolean = members.some((member: Member) => {
    return member.status === MemberStatus.ACCEPTED;
  });

  if (hasAcceptedStatus) return null;

  // True if the User has >= 1 Member with status PENDING.
  const hasPendingStatus: boolean = members.some((member: Member) => {
    return member.status === MemberStatus.PENDING;
  });

  if (hasPendingStatus) return ErrorType.APPLICATION_PENDING;

  // True if the User has >= 1 Member with status REJECTED.
  const hasRejectedStatus: boolean = members.some((member: Member) => {
    return member.status === MemberStatus.REJECTED;
  });

  if (hasRejectedStatus) return ErrorType.APPLICATION_REJECTED;

  return null;
};

export default getLoginError;
