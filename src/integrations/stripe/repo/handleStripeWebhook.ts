import express from 'express';
import Stripe from 'stripe';

import logger from '@system/logger';
import { stripe } from '../Stripe.util';
import handleInvoicePaid from './handleInvoicePaid';

/**
 * Returns a 200 status if the Stripe webhook was handled properly.
 *
 * Handles the Stripe event properly based on the event.type.
 *
 * @param req - Express Request object that stores the query.
 * @param res - Express Response object to redirect with.
 */
const handleStripeWebhook = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  const event: Stripe.Event = stripe.webhooks.constructEvent(
    req.body,
    req.headers['stripe-signature'],
    secret
  );

  switch (event.type) {
    case 'invoice.paid':
      await handleInvoicePaid(event);
      // Send an email about the paid Stripe invoice.
      break;

    case 'invoice.upcoming':
      // Send an email for the upcoming Stripe invoice.
      break;

    default:
      logger.error({
        error: `Unhandled Stripe event: ${event.type}.`,
        message: 'Failed to handle Stripe event.'
      });
  }

  // Let Stripe know that the webhook was received.
  return res.sendStatus(200);
};

export default handleStripeWebhook;
