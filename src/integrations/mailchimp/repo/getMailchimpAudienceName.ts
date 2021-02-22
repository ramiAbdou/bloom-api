import axios, { AxiosRequestConfig } from 'axios';

interface GetMailchimpAudienceNameArgs {
  mailchimpAccessToken?: string;
  mailchimpListId?: string;
}

const getMailchimpAudienceName = async ({
  mailchimpAccessToken,
  mailchimpListId
}: GetMailchimpAudienceNameArgs): Promise<string> => {
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
