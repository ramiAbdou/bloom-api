import express from 'express';

import updateMailchimpAccessToken from '@entities/community-integrations/repo/updateMailchimpAccessToken';
import { APP, AuthQueryArgs } from '@util/constants';

/**
 * Redirects back to the React app after updating the User's tokens and
 * potentially updating their Google-related information.
 *
 * @param req - Express Request object that stores the query.
 * @param res - Express Response object to redirect with.
 */
const handleMailchimpAuth = async (
  req: express.Request,
  res: express.Response
) => {
  const { code, state: urlName } = req.query as AuthQueryArgs;
  await updateMailchimpAccessToken({ code, state: urlName });
  res.redirect(`${APP.CLIENT_URL}/${urlName}/integrations?flow=mailchimp`);
};

export default handleMailchimpAuth;
