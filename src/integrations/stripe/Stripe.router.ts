import { Request, Response } from 'express';

import { APP, AuthQueryParams } from '@constants';
import Router, { Route } from '@core/Router';
import storeStripeTokens from '@entities/community-integrations/repo/storeStripeTokens';
import logger from '@logger';

export default class StripeRouter extends Router {
  get routes(): Route[] {
    return [
      { callback: this.handleAuth, method: 'GET', route: '/auth' },
      { callback: this.handleWebhook, method: 'POST', route: '/webhook' }
    ];
  }

  private async handleAuth({ query }: Request, res: Response) {
    const { code, state: encodedUrlName } = query as AuthQueryParams;
    await storeStripeTokens(encodedUrlName, code);
    res.redirect(`${APP.CLIENT_URL}/${encodedUrlName}/integrations`);
  }

  private async handleWebhook({ body }: Request, res: Response) {
    const {
      data: { object: data },
      type
    } = body;

    console.log(data, type);
    switch (body.type) {
      case 'invoice.paid':
        // Send an email about the paid Stripe invoice.
        break;

      case 'invoice.upcoming':
        // Send an email for the upcoming Stripe invoice.
        break;

      default:
        logger.log({
          error: `Unhandled Stripe event: ${type}.`,
          level: 'ERROR'
        });
    }

    // Let Stripe know that the webhook was received.
    res.sendStatus(200);
  }
}
