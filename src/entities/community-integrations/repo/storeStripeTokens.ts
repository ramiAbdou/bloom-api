import { Event } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import CommunityIntegrations from '../CommunityIntegrations';

/**
 * Stores the Stripe tokens in the database after executing the
 * OAuth token flow.
 *
 * @param code Stripe's API produced authorization code that we exchange for
 * tokens.
 */
export default async (encodedUrlName: string, code: string): Promise<void> => {
  const bm = new BloomManager();

  const integrations = await bm.findOne(
    CommunityIntegrations,
    { community: { encodedUrlName } },
    { populate: ['community'] }
  );

  const { stripe_user_id } = await stripe.oauth.token({
    code,
    grant_type: 'authorization_code'
  });

  integrations.stripeAccountId = stripe_user_id;
  await bm.flush('STRIPE_ACCOUNT_STORED');

  // Invalidate the cache for the GET_INTEGRATIONS call.
  cache.invalidateEntries([
    `${Event.GET_INTEGRATIONS}-${integrations.community.id}`
  ]);
};
