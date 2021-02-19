import axios, { AxiosRequestConfig } from 'axios';

interface AddToMailchimpAudienceArgs {
  email: string;
  firstName: string;
  lastName: string;
  mailchimpAccessToken: string;
  mailchimpListId: string;
}

const addToMailchimpAudience = async ({
  email,
  firstName,
  lastName,
  mailchimpAccessToken,
  mailchimpListId
}: AddToMailchimpAudienceArgs) => {
  if (!mailchimpAccessToken || !mailchimpListId) return;

  const options: AxiosRequestConfig = {
    data: {
      email_address: email,
      merge_fields: { F_NAME: firstName, L_NAME: lastName },
      status: 'subscribed'
    },
    headers: { Authorization: `OAuth ${mailchimpAccessToken}` },
    method: 'POST',
    url: `https://us2.api.mailchimp.com/3.0/lists/${mailchimpListId}/members`
  };

  await axios(options);
};

export default addToMailchimpAudience;
