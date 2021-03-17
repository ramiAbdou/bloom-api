import express from 'express';

import updateStripeAccountId from '@entities/community-integrations/repo/updateStripeAccountId';
import { APP, AuthQueryArgs } from '@util/constants';

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
  await updateStripeAccountId({ code, state: urlName });
  return res.redirect(`${APP.CLIENT_URL}/${urlName}/integrations`);
};

export default handleStripeAuth;
