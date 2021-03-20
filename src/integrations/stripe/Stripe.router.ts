import bodyParser from 'body-parser';
import express from 'express';

import handleStripeAuth from './repo/handleStripeAuth';
import handleStripeWebhook from './repo/handleStripeWebhook';

const router: express.Router = express.Router();

/**
 * GET /stripe/auth - Handles the Stripe authentication.
 */
router.get('/auth', handleStripeAuth);

/**
 * POST /stripe/webhook - Handles the Stripe webhook.
 */
router.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;
