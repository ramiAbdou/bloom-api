import axios, { AxiosRequestConfig } from 'axios';

import { MailchimpList } from '@entities/integrations/Integrations.types';

interface GetMailchimpAudiences {
  mailchimpAccessToken?: string;
}

/**
 * Returns the Mailchimp Audience(s).
 *
 * @param args.mailchimpAccessToken - Mailchimp access token (for querying).
 */
const getMailchimpAudiences = async (
  args: GetMailchimpAudiences
): Promise<MailchimpList[]> => {
  const { mailchimpAccessToken } = args;
  if (!mailchimpAccessToken) return [];

  const options: AxiosRequestConfig = {
    headers: { Authorization: `OAuth ${mailchimpAccessToken}` },
    method: 'GET',
    url: `https://us2.api.mailchimp.com/3.0/lists`
  };

  const { data } = await axios(options);
  return data?.lists?.map(({ id, name }) => ({ id, name }));
};

export default getMailchimpAudiences;
