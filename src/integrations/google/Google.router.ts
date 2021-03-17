import express from 'express';

import handleGoogleAuth from './repo/handleGoogleAuth';

const router: express.Router = express.Router();

/**
 * GET: Google Login Authentication
 */
router.get('/auth', handleGoogleAuth);

export default router;
