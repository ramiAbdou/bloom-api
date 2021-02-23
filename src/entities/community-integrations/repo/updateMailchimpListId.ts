import { ArgsType, Field } from 'type-graphql';

import { GQLContext, IntegrationsBrand } from '@constants';
import BloomManager from '@core/db/BloomManager';
import emitEmailEvent from '@core/events/emitEmailEvent';
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

  emitEmailEvent({
    emailContext: { brand: IntegrationsBrand.MAILCHIMP, communityId },
    emailEvent: EmailEvent.CONNECT_INTEGRATIONS
  });

  return integrations;
};

export default updateMailchimpListId;
