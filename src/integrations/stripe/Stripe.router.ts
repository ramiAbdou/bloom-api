import bodyParser from 'body-parser';
import express from 'express';

import handleStripeAuth from './repo/handleStripeAuth';
import handleStripeWebhook from './repo/handleStripeWebhook';

const stripeRouter: express.Router = express.Router();

/**
 * GET /stripe/auth - Handles the Stripe authentication.
 */
stripeRouter.get('/auth', handleStripeAuth);

/**
 * POST /stripe/webhook - Handles the Stripe webhook.
 */
stripeRouter.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default stripeRouter;
