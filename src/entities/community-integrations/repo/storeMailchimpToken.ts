import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';

import { APP, isProduction } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import CommunityIntegrations from '../CommunityIntegrations';
import { CommunityIntegrationsAuthArgs } from '../CommunityIntegrations.types';

/**
 * Returns the updated community after updating it's Mailchimp token. If
 * no community was found based on the urlName, returns null.
 *
 * Precondition: The community ID must represent a community.
 */
const storeMailchimpToken = async ({
  code,
  urlName
}: CommunityIntegrationsAuthArgs): Promise<CommunityIntegrations> => {
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

  const integrations = await new BloomManager().findOneAndUpdate(
    CommunityIntegrations,
    { community: { urlName } },
    { mailchimpAccessToken: data?.access_token },
    { event: FlushEvent.STORE_MAILCHIMP_TOKEN }
  );

  return integrations;
};

export default storeMailchimpToken;
