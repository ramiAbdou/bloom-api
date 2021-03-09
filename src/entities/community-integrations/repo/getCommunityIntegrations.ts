import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import CommunityIntegrations from '../CommunityIntegrations';

@ArgsType()
export class GetCommunityIntegrationsArgs {
  @Field({ nullable: true })
  communityId?: string;
}

/**
 * Returns the CommunityIntegrations.
 *
 * @param args.communityId - ID of the Community.
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const getCommunityIntegrations = async (
  args: GetCommunityIntegrationsArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<CommunityIntegrations> => {
  const communityId: string = args.communityId ?? ctx.communityId;

  const communityIntegrations: CommunityIntegrations = await new BloomManager().findOne(
    CommunityIntegrations,
    { community: communityId },
    { cacheKey: `${QueryEvent.GET_COMMUNITY_INTEGRATIONS}-${communityId}` }
  );

  return communityIntegrations;
};

export default getCommunityIntegrations;
