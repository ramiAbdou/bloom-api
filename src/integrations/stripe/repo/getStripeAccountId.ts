import Stripe from 'stripe';

import { AuthQueryArgs } from '@util/constants';
import { stripe } from '../Stripe.util';

const getStripeAccountId = async ({ code }: AuthQueryArgs): Promise<string> => {
  const token: Stripe.OAuthToken = await stripe.oauth.token({
    code,
    grant_type: 'authorization_code'
  });

  return token.stripe_user_id;
};

export default getStripeAccountId;
