import Stripe from 'stripe';

import { AuthQueryArgs } from '@util/constants';
import { stripe } from '../Stripe.util';

/**
 * Returns the Stripe.Account ID.
 *
 * @param args.code - Code to exchange for token from Stripe API.
 */
const getStripeAccountId = async (args: AuthQueryArgs): Promise<string> => {
  const { code } = args;

  const token: Stripe.OAuthToken = await stripe.oauth.token({
    code,
    grant_type: 'authorization_code'
  });

  return token.stripe_user_id;
};

export default getStripeAccountId;
