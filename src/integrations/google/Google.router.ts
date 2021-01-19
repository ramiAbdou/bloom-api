import { Request, Response, Router } from 'express';

import { APP } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { User } from '@entities/entities';
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

  const loginError: LoginError = await getLoginError(user);
  if (loginError) res.cookie('LOGIN_ERROR', loginError);
  else await refreshToken({ res, user });

  res.redirect(APP.CLIENT_URL);
});

export default router;
