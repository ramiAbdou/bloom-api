import express from 'express';

import handleGoogleAuth from './repo/handleGoogleAuth';

const googleRouter: express.Router = express.Router();

/**
 * GET /google/auth - Handles the Google authentication.
 */
googleRouter.get('/auth', handleGoogleAuth);

export default googleRouter;
