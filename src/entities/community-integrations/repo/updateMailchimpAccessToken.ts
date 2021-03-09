import BloomManager from '@core/db/BloomManager';
import getMailchimpAccessToken from '@integrations/mailchimp/repo/getMailchimpAccessToken';
import { AuthQueryArgs } from '@util/constants';
import { FlushEvent } from '@util/events';
import CommunityIntegrations from '../CommunityIntegrations';

/**
 * Returns the updated CommunityIntegrations.
 *
 * @param args.code - Code to exchange for token from Mailchimp API.
 */
const updateMailchimpAccessToken = async (
  args: AuthQueryArgs
): Promise<CommunityIntegrations> => {
  const { code, state: urlName } = args;
  const mailchimpAccessToken = await getMailchimpAccessToken({ code });

  const communityIntegrations = await new BloomManager().findOneAndUpdate(
    CommunityIntegrations,
    { community: { urlName } },
    { mailchimpAccessToken },
    { flushEvent: FlushEvent.UPDATE_MAILCHIMP_ACCESS_TOKEN }
  );

  return communityIntegrations;
};

export default updateMailchimpAccessToken;
