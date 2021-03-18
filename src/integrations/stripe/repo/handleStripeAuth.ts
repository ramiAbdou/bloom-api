import express from 'express';

import updateStripeAccountId from '@entities/community-integrations/repo/updateStripeAccountId';
import createStripeProducts from '@entities/member-plan/repo/createStripeProducts';
import { APP, AuthQueryArgs } from '@util/constants';
import getStripeAccountId from './getStripeAccountId';

/**
 * Redirects back to the React app after updating the CommunityIntegration's
 * stripeAccountId.
 *
 * @param req - Express Request object that stores the query.
 * @param res - Express Response object to redirect with.
 */
const handleStripeAuth = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  const { code, state: urlName } = req.query as AuthQueryArgs;

  const stripeAccountId: string = await getStripeAccountId({
    code,
    state: urlName
  });

  await updateStripeAccountId({ stripeAccountId, urlName });
  await createStripeProducts({ urlName });

  return res.redirect(`${APP.CLIENT_URL}/${urlName}/integrations`);
};

export default handleStripeAuth;
