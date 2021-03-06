import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import Integrations from '../Integrations';

@ArgsType()
export class GetIntegrationsArgs {
  @Field({ nullable: true })
  communityId?: string;
}

/**
 * Returns the Integrations.
 *
 * @param args.communityId - ID of the Community.
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const getIntegrations = async (
  args: GetIntegrationsArgs,
  ctx: Pick<GQLContext, 'communityId'>
) => {
  const communityId: string = args.communityId ?? ctx.communityId;

  const integrations: Integrations = await new BloomManager().findOne(
    Integrations,
    { community: communityId },
    { cacheKey: `${QueryEvent.GET_INTEGRATIONS}-${communityId}` }
  );

  return integrations;
};

export default getIntegrations;
