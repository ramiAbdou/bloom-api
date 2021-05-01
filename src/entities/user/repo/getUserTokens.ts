import { Field, ObjectType } from 'type-graphql';

import { GQLContext } from '@util/constants';

@ObjectType()
export class GetUserTokensResult {
  @Field({ nullable: true })
  userId: string;
}

/**
 * Returns the communityId, memberId and userId from the decoded accessToken.
 * If the urlName is present and the active communityId does not match, we
 * refresh the token to be for that community (effectively switching
 * communities).
 *
 * @param ctx.userId - ID of the User (authenticated).
 */
const getUserTokens = async (
  ctx: Pick<GQLContext, 'userId'>
): Promise<GetUserTokensResult> => {
  return { userId: ctx.userId };
};

export default getUserTokens;
