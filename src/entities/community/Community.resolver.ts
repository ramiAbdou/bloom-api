import { Args, Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { PopulateArgs, TimeSeriesData } from '@util/gql.types';
import Community from './Community';
import getActiveDuesGrowth from './repo/getActiveDuesGrowth';
import getActiveMembersGrowth from './repo/getActiveMembersGrowth';
import getActiveMembersSeries from './repo/getActiveMembersSeries';
import getTotalDuesGrowth from './repo/getTotalDuesGrowth';
import getTotalDuesSeries from './repo/getTotalDuesSeries';
import getTotalMembersGrowth from './repo/getTotalMembersGrowth';
import getTotalMembersSeries from './repo/getTotalMembersSeries';

@Resolver()
export default class CommunityResolver {
  @Authorized('ADMIN')
  @Query(() => Number)
  async getActiveDuesGrowth(@Ctx() ctx: GQLContext): Promise<number> {
    return getActiveDuesGrowth(ctx);
  }

  @Authorized('ADMIN')
  @Query(() => [Number, Number])
  async getActiveMembersGrowth(@Ctx() ctx: GQLContext): Promise<number[]> {
    return getActiveMembersGrowth(ctx);
  }

  @Authorized('ADMIN')
  @Query(() => [TimeSeriesData])
  async getActiveMembersSeries(
    @Ctx() ctx: GQLContext
  ): Promise<TimeSeriesData[]> {
    return getActiveMembersSeries(ctx);
  }

  @Authorized()
  @Query(() => Community, { nullable: true })
  async getCommunity(
    @Args() { populate }: PopulateArgs,
    @Ctx() { communityId }: GQLContext
  ): Promise<Community> {
    return new BloomManager().findOne(
      Community,
      { id: communityId },
      { populate }
    );
  }

  @Authorized('ADMIN')
  @Query(() => Community, { nullable: true })
  async getIntegrations(
    @Ctx() { communityId }: GQLContext
  ): Promise<Community> {
    return new BloomManager().findOne(
      Community,
      { id: communityId },
      {
        cacheKey: `${QueryEvent.GET_INTEGRATIONS}-${communityId}`,
        populate: ['integrations', 'types']
      }
    );
  }

  @Authorized('ADMIN')
  @Query(() => Community, { nullable: true })
  async getPayments(@Ctx() { communityId }: GQLContext): Promise<Community> {
    return new BloomManager().findOne(
      Community,
      { id: communityId },
      {
        cacheKey: `${QueryEvent.GET_PAYMENTS}-${communityId}`,
        populate: ['payments.member.user', 'payments.type']
      }
    );
  }

  @Authorized('ADMIN')
  @Query(() => Number)
  async getTotalDuesGrowth(@Ctx() ctx: GQLContext): Promise<number> {
    return getTotalDuesGrowth(ctx);
  }

  @Authorized('ADMIN')
  @Query(() => [TimeSeriesData])
  async getTotalDuesSeries(@Ctx() ctx: GQLContext): Promise<TimeSeriesData[]> {
    return getTotalDuesSeries(ctx);
  }

  @Authorized('ADMIN')
  @Query(() => [Number, Number])
  async getTotalMembersGrowth(@Ctx() ctx: GQLContext): Promise<number[]> {
    return getTotalMembersGrowth(ctx);
  }

  @Authorized('ADMIN')
  @Query(() => [TimeSeriesData])
  async getTotalMembersSeries(
    @Ctx() ctx: GQLContext
  ): Promise<TimeSeriesData[]> {
    return getTotalMembersSeries(ctx);
  }
}
