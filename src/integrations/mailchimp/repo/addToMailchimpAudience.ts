import axios, { AxiosRequestConfig } from 'axios';

interface AddToMailchimpAudienceArgs {
  email: string;
  firstName: string;
  lastName: string;
  mailchimpAccessToken: string;
  mailchimpListId: string;
}

/**
 * Adds someone to the Mailchimp Audience.
 *
 * @param args.email - Email to add to Mailchimp audience.
 * @param args.firstName - First name to add to Mailchimp audience.
 * @param args.lastName - Last name to add to Mailchimp audience.
 * @param args.mailchimpAccessToken - Mailchimp access token (for querying).
 * @param args.mailchimpListId - ID of the Mailchimp List to add to.
 */
const addToMailchimpAudience = async (args: AddToMailchimpAudienceArgs) => {
  const {
    email,
    firstName,
    lastName,
    mailchimpAccessToken,
    mailchimpListId
  } = args;

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
