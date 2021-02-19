import { Request, Response, Router } from 'express';

import { APP, AuthQueryArgs } from '@constants';
import storeMailchimpToken from '@entities/community-integrations/repo/storeMailchimpToken';

const router = Router();

router.get('/auth', async ({ query }: Request, res: Response) => {
  const { code, state: urlName } = query as AuthQueryArgs;
  await storeMailchimpToken({ code, urlName });
  res.redirect(`${APP.CLIENT_URL}/${urlName}/integrations?flow=mailchimp`);
});

export default router;
