import express from 'express';

import handleMailchimpAuth from './repo/handleMailchimpAuth';

const router: express.Router = express.Router();

/**
 * GET: Mailchimp Login Authentication
 */
router.get('/auth', handleMailchimpAuth);

export default router;
