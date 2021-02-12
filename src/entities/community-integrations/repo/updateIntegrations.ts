import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '../CommunityIntegrations';

@ArgsType()
export class UpdateIntegrationsArgs {
  @Field({ nullable: true })
  mailchimpListId?: string;
}

const updateIntegrations = async (
  args: UpdateIntegrationsArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
) => {
  return new BloomManager().findOneAndUpdate(
    CommunityIntegrations,
    { community: { id: communityId } },
    { ...args },
    {
      cacheKeysToInvalidate: [`${QueryEvent.GET_INTEGRATIONS}-${communityId}`],
      event: args?.mailchimpListId ? 'UPDATE_MAILCHIMP' : null
    }
  );
};

export default updateIntegrations;
