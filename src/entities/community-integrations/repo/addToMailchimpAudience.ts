import axios, { AxiosRequestConfig } from 'axios';

import { isProduction } from '@constants';
import logger from '@util/logger';
import Community from '../../community/Community';
import Member from '../../member/Member';

/**
 * Adds all of the users associated with the members to the Mailchimp
 * audience stored in the community.
 */
const addToMailchimpAudience = async (
  members: Member[],
  community: Community
) => {
  if (!isProduction) return;

  const { mailchimpAccessToken, mailchimpListId } = community.integrations;

  // Format the data that we send to Mailchimp to add users to the audience.
  const mailchimpMembers = members.map(({ user }) => ({
    email_address: user.email,
    merge_fields: { F_NAME: user.firstName, L_NAME: user.lastName },
    status: 'subscribed'
  }));

  const options: AxiosRequestConfig = {
    data: { members: mailchimpMembers },
    headers: { Authorization: `OAuth ${mailchimpAccessToken}` },
    method: 'POST',
    url: `https://us2.api.mailchimp.com/3.0/lists/${mailchimpListId}`
  };

  await axios(options);

  logger.log({
    changes: members.map(({ id }) => ({
      id,
      payload: [],
      table: 'members',
      type: 'OTHER_UPDATE'
    })),
    event: 'ADD_TO_MAILCHIMP',
    level: 'INFO'
  });
};

export default addToMailchimpAudience;
