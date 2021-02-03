import Stripe from 'stripe';

import { isProduction } from '@constants';

export const stripe = new Stripe(
  isProduction ? process.env.STRIPE_API_KEY : process.env.STRIPE_TEST_API_KEY,
  { apiVersion: '2020-08-27', typescript: true }
);
