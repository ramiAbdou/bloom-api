import BloomManager from '@core/db/BloomManager';
import createStripeProducts from '@entities/member-plan/repo/createStripeProducts';
import getStripeAccountId from '@integrations/stripe/repo/getStripeAccountId';
import { emitEmailEvent } from '@system/eventBus';
import { AuthQueryArgs, IntegrationsBrand } from '@util/constants';
import { EmailEvent, FlushEvent } from '@util/events';
import CommunityIntegrations from '../CommunityIntegrations';

/**
 * Stores the Stripe tokens in the database after executing the
 * OAuth token flow.
 *
 * @param code - Code to exchange for token from Stripe API.
 */
const updateStripeAccountId = async (
  args: AuthQueryArgs
): Promise<CommunityIntegrations> => {
  const { code, state: urlName } = args;
  const stripeAccountId: string = await getStripeAccountId({ code });

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

  await createStripeProducts({
    communityId: communityIntegrations.community.id
  });

  return communityIntegrations;
};

export default updateStripeAccountId;
