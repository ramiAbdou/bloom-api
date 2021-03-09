import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { emitEmailEvent } from '@system/eventBus';
import { GQLContext, IntegrationsBrand } from '@util/constants';
import { EmailEvent, MutationEvent } from '@util/events';
import Integrations from '../Integrations';

@ArgsType()
export class UpdateMailchimpListIdArgs {
  @Field()
  mailchimpListId: string;
}

/**
 * Returns the updated Integrations.
 *
 * @param args.mailchimpListId - ID of the Mailchimp List.
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const updateMailchimpListId = async (
  args: UpdateMailchimpListIdArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Integrations> => {
  const { mailchimpListId } = args;
  const { communityId } = ctx;

  const integrations = await new BloomManager().findOneAndUpdate(
    Integrations,
    { community: communityId },
    { mailchimpListId },
    { flushEvent: MutationEvent.UPDATE_MAILCHIMP_LIST_ID }
  );

  emitEmailEvent(EmailEvent.CONNECT_INTEGRATIONS, {
    brand: IntegrationsBrand.MAILCHIMP,
    communityId
  });

  return integrations;
};

export default updateMailchimpListId;
