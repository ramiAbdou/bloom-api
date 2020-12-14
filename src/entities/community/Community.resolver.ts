import { Arg, Authorized, Ctx, Query, Resolver } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import { Event, GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Community from './Community';

@Resolver()
export default class CommunityResolver {
  @Query(() => Community, { nullable: true })
  async getApplication(
    @Arg('encodedUrlName') encodedUrlName: string
  ): Promise<Community> {
    return new BloomManager().findOne(
      Community,
      { encodedUrlName },
      {
        cacheKey: `${Event.GET_APPLICATION}-${encodedUrlName}`,
        populate: ['application', 'questions']
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
        cacheKey: `${Event.GET_APPLICANTS}-${communityId}`,
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
      { id: communityId, members: { status: ['INVITED', 'ACCEPTED'] } },
      {
        cacheKey: `${Event.GET_MEMBERS}-${communityId}`,
        populate: ['questions', 'members.data', 'members.type', 'members.user']
      }
    );
  }

  @Authorized('ADMIN')
  @Query(() => Community, { nullable: true })
  async getDirectory(@Ctx() { communityId }: GQLContext): Promise<Community> {
    return new BloomManager().findOne(
      Community,
      { id: communityId, members: { status: 'ACCEPTED' } },
      {
        cacheKey: `${Event.GET_DIRECTORY}-${communityId}`,
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
        cacheKey: `${Event.GET_INTEGRATIONS}-${communityId}`,
        populate: ['integrations']
      }
    );
  }
}
