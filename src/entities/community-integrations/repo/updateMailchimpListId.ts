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

/**
 * Returns the updated CommunityIntegrations.
 *
 * @param args.mailchimpListId - ID of the Mailchimp List.
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const updateMailchimpListId = async (
  args: UpdateMailchimpListIdArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<CommunityIntegrations> => {
  const { mailchimpListId } = args;
  const { communityId } = ctx;

  const communityIntegrations = await new BloomManager().findOneAndUpdate(
    CommunityIntegrations,
    { community: communityId },
    { mailchimpListId },
    { flushEvent: FlushEvent.UPDATE_MAILCHIMP_LIST_ID }
  );

  emitEmailEvent(EmailEvent.CONNECT_INTEGRATIONS, {
    brand: IntegrationsBrand.MAILCHIMP,
    communityId
  });

  return communityIntegrations;
};

export default updateMailchimpListId;
