import { Args, Ctx, Query, Resolver } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { UrlNameArgs } from '../../util/gql.types';
import MemberType from './MemberType';

@Resolver()
export default class MemberTypeResolver {
  @Query(() => [MemberType])
  async getTypes(
    @Args() { urlName }: UrlNameArgs,
    @Ctx() { communityId }: GQLContext
  ): Promise<MemberType[]> {
    const args: FilterQuery<MemberType> = urlName
      ? { community: { urlName } }
      : { community: { id: communityId } };

    const key = urlName ?? communityId;

    return new BloomManager().find(
      MemberType,
      { ...args },
      { cacheKey: `${QueryEvent.GET_TYPES}-${key}` }
    );
  }
}
