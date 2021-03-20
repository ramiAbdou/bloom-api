import express from 'express';

import handleGoogleAuth from './repo/handleGoogleAuth';

const router: express.Router = express.Router();

/**
 * GET /google/auth - Handles the Google authentication.
 */
router.get('/auth', handleGoogleAuth);

export default router;
