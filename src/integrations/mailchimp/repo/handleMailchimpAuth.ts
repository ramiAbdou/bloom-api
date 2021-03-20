import express from 'express';

import updateMailchimpAccessToken from '@entities/community-integrations/repo/updateMailchimpAccessToken';
import { APP, AuthQueryArgs } from '@util/constants';
import { buildUrl } from '@util/util';
import getMailchimpAccessToken from './getMailchimpAccessToken';

/**
 * Redirects back to the React app after updating the CommunityIntegration's
 * mailchimpAccessToken.
 *
 * @param req - Express Request object that stores the query.
 * @param res - Express Response object to redirect with.
 */
const handleMailchimpAuth = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  const { code, state: urlName } = req.query as AuthQueryArgs;

  const mailchimpAccessToken: string = await getMailchimpAccessToken({ code });
  await updateMailchimpAccessToken({ mailchimpAccessToken, urlName });

  const redirectUrl: string = buildUrl({
    params: { flow: 'mailchimp' },
    url: `${APP.CLIENT_URL}/${urlName}/integrations`
  });

  return res.redirect(redirectUrl);
};

export default handleMailchimpAuth;
