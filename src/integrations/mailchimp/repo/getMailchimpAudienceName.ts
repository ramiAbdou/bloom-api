import axios, { AxiosRequestConfig } from 'axios';

interface GetMailchimpAudienceNameArgs {
  mailchimpAccessToken?: string;
  mailchimpListId?: string;
}

/**
 * Returns the Mailchimp Audience name.
 *
 * @param args.mailchimpAccessToken - Mailchimp access token (for querying).
 * @param args.mailchimpListId - ID of the Mailchimp List to add to.
 */
const getMailchimpAudienceName = async (
  args: GetMailchimpAudienceNameArgs
): Promise<string> => {
  const { mailchimpAccessToken, mailchimpListId } = args;
  if (!mailchimpAccessToken || !mailchimpListId) return null;

  const options: AxiosRequestConfig = {
    headers: { Authorization: `OAuth ${mailchimpAccessToken}` },
    method: 'GET',
    url: `https://us2.api.mailchimp.com/3.0/lists/${mailchimpListId}`
  };

  const { data } = await axios(options);
  return data?.name;
};

export default getMailchimpAudienceName;
