import Stripe from 'stripe';

import { isProduction } from '@util/constants';

export const stripe = new Stripe(
  isProduction
    ? process.env.STRIPE_PROD_API_KEY
    : process.env.STRIPE_DEV_API_KEY,
  { apiVersion: '2020-08-27', typescript: true }
);
