/**
 * @fileoverview Utility: Stripe
 * @author Rami Abdou
 */

import Stripe from 'stripe';

import { INTEGRATIONS } from '@constants';

export const stripe = new Stripe(INTEGRATIONS.STRIPE_API_KEY, {
  apiVersion: '2020-08-27',
  typescript: true
});
