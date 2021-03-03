import { ArgsType, Field } from 'type-graphql';
import { FilterQuery, QueryOrder } from '@mikro-orm/core';

import { GQLContext } from '@util/constants';
import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import MemberType from '../MemberType';

@ArgsType()
export class GetMemberTypesArgs {
  @Field({ nullable: true })
  urlName?: string;
}

/**
 * Returns the MemberTypes for a community.
 *
 * @param {GetMemberTypesArgs} args
 * @param {string} [args.urlName]
 */
const getMemberTypes = async (
  args: GetMemberTypesArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<MemberType[]> => {
  const { urlName } = args;
  const { communityId } = ctx;

  const queryArgs: FilterQuery<MemberType> = urlName
    ? { community: { urlName } }
    : { community: { id: communityId } };

  const key: string = urlName ?? communityId;

  const types: MemberType[] = await new BloomManager().find(
    MemberType,
    queryArgs,
    {
      cacheKey: `${QueryEvent.GET_TYPES}-${key}`,
      orderBy: { amount: QueryOrder.ASC }
    }
  );

  return types;
};

export default getMemberTypes;
