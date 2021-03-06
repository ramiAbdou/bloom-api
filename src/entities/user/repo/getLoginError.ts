import BloomManager from '@core/db/BloomManager';
import Member, { MemberStatus } from '@entities/member/Member';
import acceptInvitations from '@entities/member/repo/acceptInvitations';
import { ErrorType } from '@util/errors';
import User from '../User';

interface GetLoginErrorArgs {
  communityId?: string;
  email?: string;
  user?: User;
}

/**
 * Returns the user's login status error based on their members and
 * whether or not they've been accepted into a community.
 *
 * Precondition: Members MUST already be populated.
 */
const getLoginError = async (args: GetLoginErrorArgs): Promise<ErrorType> => {
  const { communityId, email } = args;

  if (communityId) {
    // Check if the email is a member of this community.
    const member: Member = await new BloomManager().findOne(Member, {
      community: { id: communityId },
      user: { email }
    });

    if (!member) return ErrorType.NOT_MEMBER;
  }

  const user: User = await new BloomManager().findOne(
    User,
    { email },
    { populate: ['members'] }
  );

  if (!user) return ErrorType.USER_NOT_FOUND;

  const members: Member[] = user.members.getItems();

  // If when trying to login, the user has some a status of INVITED (only
  // possible if an admin added them manually), then we should set those
  // statuses to be ACCEPTED.
  if (members.some(({ status }) => status === MemberStatus.INVITED)) {
    await acceptInvitations({ email });
  }

  return members.reduce((acc: ErrorType, { status }: Member) => {
    // SUCCESS CASE: If the user has been approved in some community,
    // update the refresh token in the DB.
    if ([MemberStatus.ACCEPTED, MemberStatus.INVITED].includes(status)) {
      return null;
    }

    // If acc is null and application is PENDING, don't do anything, cause
    // the user is already approved. If acc isn't null, then set error to
    // APPLICATION_PENDING.
    if (acc && status === MemberStatus.PENDING) {
      return ErrorType.APPLICATION_PENDING;
    }

    return acc;
  }, ErrorType.APPLICATION_REJECTED);
};

export default getLoginError;
