import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '../CommunityIntegrations';

interface UpdateMailchimpAccessTokenArgs {
  mailchimpAccessToken: string;
  urlName: string;
}

/**
 * Returns the updated CommunityIntegrations.
 *
 * @param args.code - Code to exchange for token from Mailchimp API.
 */
const updateMailchimpAccessToken = async (
  args: UpdateMailchimpAccessTokenArgs
): Promise<CommunityIntegrations> => {
  const { mailchimpAccessToken, urlName } = args;

  const communityIntegrations = await new BloomManager().findOneAndUpdate(
    CommunityIntegrations,
    { community: { urlName } },
    { mailchimpAccessToken }
  );

  return communityIntegrations;
};

export default updateMailchimpAccessToken;
