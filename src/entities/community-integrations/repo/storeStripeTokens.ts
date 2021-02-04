import { QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import createStripeProducts from '@entities/member-type/repo/createStripeProducts';
import { stripe } from '@integrations/stripe/Stripe.util';
import CommunityIntegrations from '../CommunityIntegrations';

/**
 * Stores the Stripe tokens in the database after executing the
 * OAuth token flow.
 *
 * @param code Stripe's API produced authorization code that we exchange for
 * tokens.
 */
const storeStripeTokens = async (
  urlName: string,
  code: string
): Promise<CommunityIntegrations> => {
  const bm = new BloomManager();

  const integrations = await bm.findOne(
    CommunityIntegrations,
    { community: { urlName } },
    { populate: ['community.types'] }
  );

  const { stripe_user_id: stripeAccountId } = await stripe.oauth.token({
    code,
    grant_type: 'authorization_code'
  });

  await createStripeProducts({
    stripeAccountId,
    types: integrations.community.types.getItems()
  });

  integrations.stripeAccountId = stripeAccountId;

  await bm.flush({
    cacheKeysToInvalidate: [
      `${QueryEvent.GET_INTEGRATIONS}-${integrations.community.id}`
    ],
    event: 'STORE_STRIPE_ACCOUNT'
  });

  return integrations;
};

export default storeStripeTokens;
