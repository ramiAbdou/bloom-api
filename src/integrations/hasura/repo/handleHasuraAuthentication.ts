import express from 'express';

import { HasuraRole } from '../Hasura.types';

/**
 * Returns a 200 response along with JSON that specifies the permissions of the
 * signed-in (or not signed-in) user.
 *
 * @param req - Express Request object that stores the trigger body.
 * @param res - Express Response object to respond with.
 */
const handleHasuraAuthentication = async (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  return res.json({
    'X-Hasura-Custom': 'hello',
    'X-Hasura-Is-Owner': 'true',
    'X-Hasura-Member-Id': '1',
    'X-Hasura-Role': HasuraRole.GUEST
  });
};

export default handleHasuraAuthentication;
