import express from 'express';

import refreshToken from '@entities/user/repo/refreshToken';
import { decodeToken, verifyToken } from '@util/util';
import { HasuraRole } from '../Hasura.types';
import getHasuraRole from './getHasuraRole';

interface HasuraAuthenticationCookies {
  accessToken?: string;
  refreshToken?: string;
}

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
  const {
    accessToken,
    refreshToken: rToken
  }: HasuraAuthenticationCookies = req.cookies;

  // If there is no accessToken, there is a valid refreshToken, then we should
  // refresh the accessToken and store it on the req and res objects.
  const updatedAccessToken: string =
    accessToken ?? verifyToken(rToken)
      ? await refreshToken({ refreshToken: rToken }, { req, res })
      : null;

  const communityId: string = req.headers.communityid as string;
  const userId: string = decodeToken(updatedAccessToken)?.userId as string;

  const hasuraRole: HasuraRole = await getHasuraRole({ communityId, userId });

  return res.json({
    'X-Access-Token': updatedAccessToken ?? '',
    'X-Hasura-Role': hasuraRole
  });
};

export default handleHasuraAuthentication;
