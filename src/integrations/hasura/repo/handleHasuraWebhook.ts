import express from 'express';

import { HasuraRole } from '../Hasura.types';

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
  return res.json({
    'X-Hasura-Custom': 'hello',
    'X-Hasura-Is-Owner': 'true',
    'X-Hasura-Role': HasuraRole.GUEST,
    'X-Hasura-User-Id': '1'
  });
};

export default handleHasuraWebhook;
