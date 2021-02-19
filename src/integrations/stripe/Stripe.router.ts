import bodyParser from 'body-parser';
import { Request, Response, Router } from 'express';
import Stripe from 'stripe';

import { APP, AuthQueryParams, isProduction } from '@constants';
import storeStripeAccount from '@entities/community-integrations/repo/storeStripeAccount';
import logger from '@logger';
import { stripe } from './Stripe.util';
import handleInvoicePaid from './webhooks/handleInvoicePaid';

const router = Router();

router.get('/auth', async ({ query }: Request, res: Response) => {
  const { code, state: urlName } = query as AuthQueryParams;
  await storeStripeAccount({ code, urlName });
  res.redirect(`${APP.CLIENT_URL}/${urlName}/integrations`);
});

router.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const secret = isProduction
      ? process.env.STRIPE_WEBHOOK_SECRET
      : process.env.STRIPE_TEST_WEBHOOK_SECRET;

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
        logger.log({
          error: `Unhandled Stripe event: ${event.type}.`,
          level: 'ERROR'
        });
    }

    // Let Stripe know that the webhook was received.
    res.sendStatus(200);
  }
);

export default router;
