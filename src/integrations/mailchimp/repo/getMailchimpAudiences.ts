import axios, { AxiosRequestConfig } from 'axios';

interface GetMailchimpAudiences {
  mailchimpAccessToken?: string;
}

const getMailchimpAudiences = async ({
  mailchimpAccessToken
}: GetMailchimpAudiences) => {
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
