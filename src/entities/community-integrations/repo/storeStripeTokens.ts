import { wrap } from '@mikro-orm/core';

import { QueryEvent } from '@constants';
import cache from '@core/cache';
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
export default async (encodedUrlName: string, code: string): Promise<void> => {
  const bm = new BloomManager();

  const integrations = await bm.findOne(
    CommunityIntegrations,
    { community: { encodedUrlName } },
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

  wrap(integrations).assign({ stripeAccountId });
  await bm.flush('STRIPE_ACCOUNT_STORED');

  // Invalidate the cache for the GET_INTEGRATIONS call.
  cache.invalidateEntries([
    `${QueryEvent.GET_INTEGRATIONS}-${integrations.community.id}`
  ]);
};
