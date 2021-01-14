import { Request, Response, Router } from 'express';

import { APP } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Member, User } from '@entities/entities';
import updateInvitedStatuses from '@entities/member/repo/updateInvitedStatus';
import getLoginError, { LoginError } from '@entities/user/repo/getLoginError';
import refreshToken from '@entities/user/repo/refreshToken';
import { getEmailFromCode } from './Google.util';

const router = Router();

router.get('/auth', async ({ query }: Request, res: Response) => {
  const email = await getEmailFromCode(query.code as string);

  const user: User = await new BloomManager().findOne(
    User,
    { email },
    { populate: ['members'] }
  );

  const members: Member[] = user.members.getItems();

  // If when trying to login, the user has some a status of INVITED (only
  // possible if an admin added them manually), then we should set those
  // statuses to be ACCEPTED.
  if (members.some(({ status }) => status === 'INVITED')) {
    await updateInvitedStatuses(members);
  }

  const loginError: LoginError = await getLoginError(user);
  if (loginError) res.cookie('LOGIN_ERROR', loginError);
  else await refreshToken({ res, user });

  res.redirect(APP.CLIENT_URL);
});

export default router;
