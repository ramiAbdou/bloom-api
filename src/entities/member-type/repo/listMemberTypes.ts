import { ArgsType, Field } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import MemberType from '../MemberType';

@ArgsType()
export class ListMemberTypesArgs {
  @Field({ nullable: true })
  communityId?: string;
}

/**
 * Returns the MemberType(s) in a Community.
 *
 * @param args.communityId - ID of the Community.
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const listMemberTypes = async (
  args: ListMemberTypesArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<MemberType[]> => {
  const communityId: string = args.communityId ?? ctx.communityId;

  const memberTypes: MemberType[] = await new BloomManager().find(
    MemberType,
    { community: communityId },
    {
      cacheKey: `${QueryEvent.LIST_MEMBER_TYPES}-${communityId}`,
      orderBy: { amount: QueryOrder.ASC }
    }
  );

  return memberTypes;
};

export default listMemberTypes;
