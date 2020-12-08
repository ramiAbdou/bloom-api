import { Args, Authorized, Ctx, Query, Resolver } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import { Event, GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Community } from '@entities';
import { GetCommunityArgs } from './Community.args';

@Resolver()
export default class CommunityResolver {
  @Query(() => Community, { nullable: true })
  async getApplication(
    @Args() { encodedUrlName }: GetCommunityArgs
  ): Promise<Community> {
    return new BloomManager()
      .communityRepo()
      .findOne(
        { encodedUrlName },
        ['application', 'questions'],
        null,
        `${Event.GET_APPLICATION}-${encodedUrlName}`
      );
  }

  @Authorized('ADMIN')
  @Query(() => Community, { nullable: true })
  async getApplicants(@Ctx() { communityId }: GQLContext): Promise<Community> {
    return new BloomManager()
      .communityRepo()
      .findOne(
        { id: communityId, members: { status: 'PENDING' } },
        ['questions', 'members.data', 'members.type', 'members.user'],
        { createdAt: QueryOrder.DESC },
        `${Event.GET_APPLICANTS}-${communityId}`
      );
  }

  @Authorized('ADMIN')
  @Query(() => Community, { nullable: true })
  async getDatabase(@Ctx() { communityId }: GQLContext): Promise<Community> {
    return new BloomManager()
      .communityRepo()
      .findOne(
        { id: communityId, members: { status: ['INVITED', 'ACCEPTED'] } },
        ['questions', 'members.data', 'members.type', 'members.user'],
        null,
        `${Event.GET_MEMBERS}-${communityId}`
      );
  }

  @Authorized('ADMIN')
  @Query(() => Community, { nullable: true })
  async getDirectory(@Ctx() { communityId }: GQLContext): Promise<Community> {
    return new BloomManager()
      .communityRepo()
      .findOne(
        { id: communityId, members: { status: 'ACCEPTED' } },
        ['questions', 'members.data', 'members.type', 'members.user'],
        null,
        `${Event.GET_DIRECTORY}-${communityId}`
      );
  }

  @Authorized('ADMIN')
  @Query(() => Community, { nullable: true })
  async getIntegrations(
    @Ctx() { communityId }: GQLContext
  ): Promise<Community> {
    return new BloomManager()
      .communityRepo()
      .findOne(
        { id: communityId },
        ['integrations'],
        null,
        `${Event.GET_INTEGRATIONS}-${communityId}`
      );
  }
}
