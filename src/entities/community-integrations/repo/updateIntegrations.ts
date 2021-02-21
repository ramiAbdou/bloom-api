import { ArgsType, Field } from 'type-graphql';

import { GQLContext, IntegrationsBrand } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { EmailEvent, FlushEvent } from '@util/events';
import CommunityIntegrations from '../CommunityIntegrations';

type UpdateIntegrationsFlushEvent =
  | FlushEvent.UPDATE_MAILCHIMP_LIST_ID
  | FlushEvent.UPDATE_STRIPE_ACCOUNT_ID;

@ArgsType()
export class UpdateIntegrationsArgs {
  @Field(() => String, { nullable: true })
  flushEvent: UpdateIntegrationsFlushEvent;

  @Field({ nullable: true })
  mailchimpListId?: string;

  @Field({ nullable: true })
  stripeAccountId?: string;
}

const updateIntegrations = async (
  { flushEvent, ...args }: UpdateIntegrationsArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
) => {
  return new BloomManager().findOneAndUpdate(
    CommunityIntegrations,
    { community: { id: communityId } },
    { ...args },
    {
      emailContext: {
        brand:
          flushEvent === FlushEvent.UPDATE_MAILCHIMP_LIST_ID
            ? IntegrationsBrand.MAILCHIMP
            : IntegrationsBrand.STRIPE,
        communityId
      },
      emailEvent: EmailEvent.CONNECT_INTEGRATIONS,
      flushEvent
    }
  );
};

export default updateIntegrations;
