import express from 'express';

import handleHasuraAuthentication from './repo/handleHasuraAuthentication';
import handleHasuraEventTrigger from './repo/handleHasuraEventTrigger';

const hasuraRouter: express.Router = express.Router();

/**
 * GET /hasura/webhook - Handles the Hasura webhook.
 */
hasuraRouter.get('/auth', handleHasuraAuthentication);

/**
 * POST /hasura/webhook - Handles the Hasura webhook.
 */
hasuraRouter.post('/webhook', handleHasuraEventTrigger);

export default hasuraRouter;
