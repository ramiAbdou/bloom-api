import express from 'express';

import handleHasuraAuthentication from './handleHasuraAuthentication';
import handleHasuraEventTrigger from './handleHasuraEventTrigger';

/**
 * Returns a 200 status if the Stripe webhook was handled properly.
 *
 * Handles the Stripe event properly based on the event.type.
 *
 * @param req - Express Request object that stores the query.
 * @param res - Express Response object to redirect with.
 */
const handleHasuraWebhook = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  if (req.body.event && req.body.trigger) {
    return handleHasuraEventTrigger(req, res);
  }

  return handleHasuraAuthentication(req, res);
};

export default handleHasuraWebhook;
