import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
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
    { event: args?.mailchimpListId ? 'UPDATE_MAILCHIMP' : null }
  );
};

export default updateIntegrations;
