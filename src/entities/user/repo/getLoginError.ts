import updateInvitedStatuses from '@entities/member/repo/updateInvitedStatus';
import Member from '../../member/Member';
import User from '../User';

export type LoginError =
  | 'APPLICATION_PENDING'
  | 'APPLICATION_REJECTED'
  | 'USER_NOT_FOUND';

/**
 * Returns the user's login status error based on their members and
 * whether or not they've been accepted into a community.
 *
 * Precondition: Members MUST already be populated.
 */
const getLoginError = async (user: User): Promise<LoginError> => {
  if (!user) return 'USER_NOT_FOUND';

  const members: Member[] = user.members.getItems();

  // If when trying to login, the user has some a status of INVITED (only
  // possible if an admin added them manually), then we should set those
  // statuses to be ACCEPTED.
  if (members.some(({ status }) => status === 'INVITED')) {
    await updateInvitedStatuses(members);
  }

  return user.members
    .getItems()
    .reduce((acc: LoginError, { status }: Member) => {
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
