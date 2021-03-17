import express from 'express';

import handleMailchimpAuth from './repo/handleMailchimpAuth';

const router: express.Router = express.Router();

/**
 * GET /mailchimp/auth - Handles the Mailchimp authentication.
 */
router.get('/auth', handleMailchimpAuth);

export default router;
