import bodyParser from 'body-parser';
import { Request, Response, Router } from 'express';
import Stripe from 'stripe';

import { APP, AuthQueryParams, isProduction } from '@constants';
import storeStripeTokens from '@entities/community-integrations/repo/storeStripeTokens';
import logger from '@logger';
import { handleInvoicePaid, stripe } from './Stripe.util';

const router = Router();

router.get('/auth', async ({ query }: Request, res: Response) => {
  const { code, state: encodedUrlName } = query as AuthQueryParams;
  await storeStripeTokens(encodedUrlName, code);
  res.redirect(`${APP.CLIENT_URL}/${encodedUrlName}/integrations`);
});

router.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const secret = isProduction
      ? process.env.STRIPE_WEBHOOK_SECRET
      : process.env.STRIPE_TEST_WEBHOOK_SECRET;

    console.log(req.headers['stripe-signature']);
    console.log(req.body);

    const event: Stripe.Event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      secret
    );

    console.log(event.type);

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
