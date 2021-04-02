import express from 'express';

import handleHasuraWebhook from './repo/handleHasuraWebhook';

const hasuraRouter: express.Router = express.Router();

/**
 * POST /hasura/webhook - Handles the Hasura webhook.
 */
hasuraRouter.post('/webhook', handleHasuraWebhook);

export default hasuraRouter;
