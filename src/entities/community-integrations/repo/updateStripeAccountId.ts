import BloomManager from '@core/db/BloomManager';
import { emitEmailEvent } from '@system/eventBus';
import { IntegrationsBrand } from '@util/constants';
import { EmailEvent, FlushEvent } from '@util/constants.events';
import CommunityIntegrations from '../CommunityIntegrations';

interface UpdateStripeAccountIdArgs {
  stripeAccountId: string;
  urlName: string;
}

/**
 * Stores the Stripe tokens in the database after executing the
 * OAuth token flow.
 *
 * @param args.stripeAccountId - ID of the Stripe Account to store.
 * @param args.urlName - URL name of the Community.
 */
const updateStripeAccountId = async (
  args: UpdateStripeAccountIdArgs
): Promise<CommunityIntegrations> => {
  const { stripeAccountId, urlName } = args;

  const communityIntegrations = await new BloomManager().findOneAndUpdate(
    CommunityIntegrations,
    { community: { urlName } },
    { stripeAccountId },
    { flushEvent: FlushEvent.UPDATE_STRIPE_ACCOUNT_ID }
  );

  emitEmailEvent(EmailEvent.CONNECT_INTEGRATIONS, {
    brand: IntegrationsBrand.STRIPE,
    urlName
  });

  return communityIntegrations;
};

export default updateStripeAccountId;
