import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache';
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
  const bm = new BloomManager();

  const integrations = await bm.findOne(CommunityIntegrations, {
    community: { id: communityId }
  });

  integrations.mailchimpListId = mailchimpListId;
  await bm.flush('MAILCHIMP_LIST_STORED');

  // Invalidate the cache for the GET_INTEGRATIONS call.
  cache.invalidateEntries([
    `${QueryEvent.GET_INTEGRATIONS}-${integrations.community.id}`
  ]);

  return integrations;
};
