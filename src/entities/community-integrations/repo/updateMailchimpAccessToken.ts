import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import getMailchimpAccessToken from '../../../integrations/mailchimp/repo/getMailchimpAccessToken';
import CommunityIntegrations from '../CommunityIntegrations';
import { CommunityIntegrationsAuthArgs } from '../CommunityIntegrations.types';

/**
 * Returns the updated community after updating it's Mailchimp token. If
 * no community was found based on the urlName, returns null.
 *
 * Precondition: The community ID must represent a community.
 */
const updateMailchimpAccessToken = async ({
  code,
  urlName
}: CommunityIntegrationsAuthArgs): Promise<CommunityIntegrations> => {
  const mailchimpAccessToken = await getMailchimpAccessToken({ code });

  const integrations = await new BloomManager().findOneAndUpdate(
    CommunityIntegrations,
    { community: { urlName } },
    { mailchimpAccessToken },
    { flushEvent: FlushEvent.UPDATE_MAILCHIMP_ACCESS_TOKEN }
  );

  return integrations;
};

export default updateMailchimpAccessToken;
