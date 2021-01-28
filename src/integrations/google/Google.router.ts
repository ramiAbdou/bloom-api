import { Request, Response, Router } from 'express';

import { APP } from '@constants';
import getLoginError, { LoginError } from '@entities/user/repo/getLoginError';
import refreshToken from '@entities/user/repo/refreshToken';
import { getEmailFromCode } from './Google.util';

const router = Router();

router.get('/auth', async ({ query }: Request, res: Response) => {
  const { communityId, pathname } =
    JSON.parse((query?.state ?? null) as string) ?? {};

  const email = await getEmailFromCode(query.code as string);
  const loginError: LoginError = await getLoginError({ communityId, email });

  if (loginError) res.cookie('LOGIN_ERROR', loginError);
  else await refreshToken({ email, res });

  res.redirect(APP.CLIENT_URL + (pathname ?? ''));
});

export default router;
