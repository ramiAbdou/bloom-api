import BloomManager from '@core/db/BloomManager';
import acceptInvitations from '@entities/member/repo/acceptInvitations';
import Member from '../../member/Member';
import User from '../User';

export type LoginError =
  | 'APPLICATION_PENDING'
  | 'APPLICATION_REJECTED'
  | 'NOT_MEMBER'
  | 'USER_NOT_FOUND';

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
const getLoginError = async ({
  communityId,
  email
}: GetLoginErrorArgs): Promise<LoginError> => {
  if (communityId) {
    // Check if the email is a member of this community.
    const member: Member = await new BloomManager().findOne(Member, {
      community: { id: communityId },
      user: { email }
    });

    if (!member) return 'NOT_MEMBER';
  }

  const user: User = await new BloomManager().findOne(
    User,
    { email },
    { populate: ['members'] }
  );

  if (!user) return 'USER_NOT_FOUND';

  const members: Member[] = user.members.getItems();

  // If when trying to login, the user has some a status of INVITED (only
  // possible if an admin added them manually), then we should set those
  // statuses to be ACCEPTED.
  if (members.some(({ status }) => status === 'INVITED')) {
    await acceptInvitations({ communityId, email });
  }

  return members.reduce((acc: LoginError, { status }: Member) => {
    // SUCCESS CASE: If the user has been approved in some community,
    // update the refresh token in the DB.
    if (['ACCEPTED', 'INVITED'].includes(status)) return null;

    // If acc is null and application is PENDING, don't do anything, cause
    // the user is already approved. If acc isn't null, then set error to
    // APPLICATION_PENDING.
    if (acc && status === 'PENDING') return 'APPLICATION_PENDING';
    return acc;
  }, 'APPLICATION_REJECTED');
};

export default getLoginError;
