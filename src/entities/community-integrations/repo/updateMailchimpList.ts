import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '../CommunityIntegrations';

/**
 * Stores the Mailchimp list ID that we use for adding new members to the
 * listserv.
 */
export default async (
  mailchimpListId: string,
  { communityId }: GQLContext
): Promise<CommunityIntegrations> => {
  const integrations = await new BloomManager().findOneAndUpdate(
    CommunityIntegrations,
    { community: { id: communityId } },
    { mailchimpListId },
    {
      cacheKeysToInvalidate: [`${QueryEvent.GET_INTEGRATIONS}-${communityId}`],
      event: 'MAILCHIMP_LIST_STORED'
    }
  );

  return integrations;
};
