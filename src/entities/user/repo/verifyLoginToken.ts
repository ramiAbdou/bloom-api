import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import { decodeToken } from '@util/util';
import refreshToken from './refreshToken';

@ArgsType()
export class VerifyLoginTokenArgs {
  @Field()
  token: string;
}

const verifyLoginToken = async (
  { token }: VerifyLoginTokenArgs,
  { res }: Pick<GQLContext, 'res'>
) => {
  const userId: string = decodeToken(token)?.userId;
  const tokens = await refreshToken({ res, userId });

  if (!tokens) {
    res.cookie('LOGIN_LINK_ERROR', 'TOKEN_EXPIRED');
    return false;
  }

  return true;
};

export default verifyLoginToken;
