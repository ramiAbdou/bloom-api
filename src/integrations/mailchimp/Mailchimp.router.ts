import { Request, Response, Router } from 'express';

import { APP, AuthQueryArgs } from '@util/constants';
import updateMailchimpAccessToken from '@entities/community-integrations/repo/updateMailchimpAccessToken';

const router = Router();

router.get('/auth', async ({ query }: Request, res: Response) => {
  const { code, state: urlName } = query as AuthQueryArgs;
  await updateMailchimpAccessToken({ code, state: urlName });
  res.redirect(`${APP.CLIENT_URL}/${urlName}/integrations?flow=mailchimp`);
});

export default router;
