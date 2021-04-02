import express from 'express';

import handleMailchimpAuth from './repo/handleMailchimpAuth';

const mailchimpRouter: express.Router = express.Router();

/**
 * GET /mailchimp/auth - Handles the Mailchimp authentication.
 */
mailchimpRouter.get('/auth', handleMailchimpAuth);

export default mailchimpRouter;
