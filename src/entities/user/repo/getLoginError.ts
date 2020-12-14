import { LoginError } from '@constants';
import Member from '../../member/Member';
import User from '../User';

/**
 * Returns the user's login status error based on their members and
 * whether or not they've been accepted into a community.
 *
 * Precondition: Members MUST already be populated.
 */
export default async (user: User): Promise<LoginError> =>
  !user
    ? 'USER_NOT_FOUND'
    : user.members.getItems().reduce((acc: LoginError, { status }: Member) => {
        // SUCCESS CASE: If the user has been approved in some community,
        // update the refresh token in the DB.
        if (['ACCEPTED', 'INVITED'].includes(status)) return null;

        // If acc is null and application is PENDING, don't do anything, cause
        // the user is already approved. If acc isn't null, then set error to
        // APPLICATION_PENDING.
        if (acc && status === 'PENDING') return 'APPLICATION_PENDING';
        return acc;
      }, 'APPLICATION_REJECTED');
