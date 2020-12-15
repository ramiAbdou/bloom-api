import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';

import { APP, Event, isProduction } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '../CommunityIntegrations';

/**
 * Returns the updated community after updating it's Mailchimp token. If
 * no community was found based on the encodedUrlName, returns null.
 *
 * Precondition: The community ID must represent a community.
 */
export default async (encodedUrlName: string, code: string): Promise<void> => {
  const bm = new BloomManager();

  const integrations = await bm.findOne(
    CommunityIntegrations,
    { community: { encodedUrlName } },
    { populate: ['community'] }
  );

  // All the other redirect URIs use localhost when in development, but
  // Mailchimp forces us to use 127.0.0.1 instead, so we can't use the
  // APP.SERVER_URL local URL.
  const BASE_URI = isProduction ? APP.SERVER_URL : 'http://127.0.0.1:8080';

  const options: AxiosRequestConfig = {
    data: new URLSearchParams({
      client_id: process.env.MAILCHIMP_CLIENT_ID,
      client_secret: process.env.MAILCHIMP_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${BASE_URI}/mailchimp/auth`
    }),
    method: 'POST',
    url: 'https://login.mailchimp.com/oauth2/token'
  };

  const { data } = await axios(options);
  integrations.mailchimpAccessToken = data?.access_token;

  // console.log(bm.em.getUnitOfWork().getIdentityMap().values());

  await bm.flush('MAILCHIMP_TOKEN_STORED');

  // Invalidate the cache for the GET_INTEGRATIONS call.
  cache.invalidateEntries(
    `${Event.GET_INTEGRATIONS}-${integrations.community.id}`,
    true
  );
};
