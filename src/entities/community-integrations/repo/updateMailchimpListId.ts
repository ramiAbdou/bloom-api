import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { emitEmailEvent } from '@system/eventBus';
import { GQLContext, IntegrationsBrand } from '@util/constants';
import { EmailEvent, FlushEvent } from '@util/events';
import CommunityIntegrations from '../CommunityIntegrations';

@ArgsType()
export class UpdateMailchimpListIdArgs {
  @Field()
  mailchimpListId: string;
}

const updateMailchimpListId = async (
  args: UpdateMailchimpListIdArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
) => {
  const integrations = await new BloomManager().findOneAndUpdate(
    CommunityIntegrations,
    { community: { id: communityId } },
    { ...args },
    { flushEvent: FlushEvent.UPDATE_MAILCHIMP_LIST_ID }
  );

  emitEmailEvent(EmailEvent.CONNECT_INTEGRATIONS, {
    brand: IntegrationsBrand.MAILCHIMP,
    communityId
  });

  return integrations;
};

export default updateMailchimpListId;
