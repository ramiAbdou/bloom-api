import { IntegrationsBrand } from '@constants';
import BloomManager from '@core/db/BloomManager';
import createStripeProducts from '@entities/member-type/repo/createStripeProducts';
import { stripe } from '@integrations/stripe/Stripe.util';
import { EmailEvent, FlushEvent } from '@util/events';
import CommunityIntegrations from '../CommunityIntegrations';
import { CommunityIntegrationsAuthArgs } from '../CommunityIntegrations.types';

/**
 * Stores the Stripe tokens in the database after executing the
 * OAuth token flow.
 *
 * @param code Stripe's API produced authorization code that we exchange for
 * tokens.
 */
const storeStripeAccount = async ({
  code,
  urlName
}: CommunityIntegrationsAuthArgs): Promise<CommunityIntegrations> => {
  const { stripe_user_id: stripeAccountId } = await stripe.oauth.token({
    code,
    grant_type: 'authorization_code'
  });

  const integrations = await new BloomManager().findOneAndUpdate(
    CommunityIntegrations,
    { community: { urlName } },
    { stripeAccountId },
    {
      emailContext: { brand: IntegrationsBrand.STRIPE, urlName },
      emailEvent: EmailEvent.CONNECT_INTEGRATIONS,
      flushEvent: FlushEvent.STORE_STRIPE_ACCOUNT,
      populate: ['community']
    }
  );

  await createStripeProducts({ communityId: integrations.community.id });

  return integrations;
};

export default storeStripeAccount;
