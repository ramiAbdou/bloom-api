import { Arg, Authorized, Ctx, Query, Resolver } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { TimeSeriesData } from '../member/Member.types';
import Community from './Community';
import getActiveGrowth from './repo/getActiveGrowth';
import getActiveGrowthSeries from './repo/getActiveGrowthSeries';
import getTotalGrowth from './repo/getTotalGrowth';
import getTotalGrowthSeries from './repo/getTotalGrowthSeries';

@Resolver()
export default class CommunityResolver {
  @Authorized('ADMIN')
  @Query(() => [Number, Number])
  async getActiveGrowth(@Ctx() ctx: GQLContext): Promise<number[]> {
    return getActiveGrowth(ctx);
  }

  @Authorized('ADMIN')
  @Query(() => [TimeSeriesData])
  async getActiveGrowthSeries(
    @Ctx() ctx: GQLContext
  ): Promise<TimeSeriesData[]> {
    return getActiveGrowthSeries(ctx);
  }

  @Query(() => Community, { nullable: true })
  async getApplication(@Arg('urlName') urlName: string): Promise<Community> {
    return new BloomManager().findOneOrFail(
      Community,
      { urlName },
      {
        cacheKey: `${QueryEvent.GET_APPLICATION}-${urlName}`,
        populate: ['application', 'integrations', 'questions', 'types']
      }
    );
  }

  @Authorized('ADMIN')
  @Query(() => Community, { nullable: true })
  async getApplicants(@Ctx() { communityId }: GQLContext): Promise<Community> {
    return new BloomManager().findOne(
      Community,
      { id: communityId, members: { status: 'PENDING' } },
      {
        cacheKey: `${QueryEvent.GET_APPLICANTS}-${communityId}`,
        orderBy: { createdAt: QueryOrder.DESC },
        populate: ['questions', 'members.data', 'members.type', 'members.user']
      }
    );
  }

  @Authorized('ADMIN')
  @Query(() => Community, { nullable: true })
  async getDatabase(@Ctx() { communityId }: GQLContext): Promise<Community> {
    return new BloomManager().findOne(
      Community,
      { id: communityId, members: { status: ['ACCEPTED'] } },
      {
        cacheKey: `${QueryEvent.GET_MEMBERS}-${communityId}`,
        orderBy: { members: { createdAt: QueryOrder.DESC } },
        populate: ['questions', 'members.data', 'members.type', 'members.user']
      }
    );
  }

  @Authorized()
  @Query(() => Community, { nullable: true })
  async getDirectory(@Ctx() { communityId }: GQLContext): Promise<Community> {
    return new BloomManager().findOne(
      Community,
      { id: communityId, members: { status: 'ACCEPTED' } },
      {
        cacheKey: `${QueryEvent.GET_DIRECTORY}-${communityId}`,
        orderBy: {
          members: { createdAt: QueryOrder.DESC, updatedAt: QueryOrder.DESC }
        },
        populate: ['questions', 'members.data', 'members.type', 'members.user']
      }
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
        populate: ['integrations']
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
  @Query(() => [Number, Number])
  async getTotalGrowth(@Ctx() ctx: GQLContext): Promise<number[]> {
    return getTotalGrowth(ctx);
  }

  @Authorized('ADMIN')
  @Query(() => [TimeSeriesData])
  async getTotalGrowthSeries(
    @Ctx() ctx: GQLContext
  ): Promise<TimeSeriesData[]> {
    return getTotalGrowthSeries(ctx);
  }
}
