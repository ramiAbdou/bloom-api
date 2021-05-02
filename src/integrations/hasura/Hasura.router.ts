import express from 'express';

import handleHasuraAuthentication from './repo/handleHasuraAuthentication';
import handleHasuraCronTrigger from './repo/handleHasuraCronTrigger';
import handleHasuraEventTrigger from './repo/handleHasuraEventTrigger';

const hasuraRouter: express.Router = express.Router();

/**
 * GET /hasura/webhook - Handles the Hasura webhook.
 */
hasuraRouter.get('/auth', handleHasuraAuthentication);

/**
 * POST /hasura/cron - Handles the Hasura CRON job.
 */
hasuraRouter.post('/cron', handleHasuraCronTrigger);

/**
 * POST /hasura/webhook - Handles the Hasura webhook.
 */
hasuraRouter.post('/webhook', handleHasuraEventTrigger);

export default hasuraRouter;
