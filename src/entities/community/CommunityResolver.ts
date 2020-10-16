/**
 * @fileoverview Resolver: Community
 * @author Rami Abdou
 */

import { Args, Mutation, Query, Resolver } from 'type-graphql';

import { Community } from '@entities';
import BloomManager from '@util/db/BloomManager';
import { Populate } from '@util/gql';
import {
  CreateCommunityArgs,
  GetCommunityArgs,
  ImportCommunityCSVArgs
} from './CommunityArgs';

@Resolver()
export default class CommunityResolver {
  @Mutation(() => Community, { nullable: true })
  async createCommunity(@Args() args: CreateCommunityArgs): Promise<Community> {
    return new BloomManager().communityRepo().createCommunity(args);
  }

  @Query(() => Community, { nullable: true })
  async getCommunity(
    @Args() { encodedUrlName, id }: GetCommunityArgs,
    @Populate() populate: string[]
  ): Promise<Community> {
    const queryBy = id ? { id } : { encodedUrlName };
    return new BloomManager().communityRepo().findOne({ ...queryBy }, populate);
  }

  @Mutation(() => Community, { nullable: true })
  async importCSVDataToCommunity(
    @Args() args: ImportCommunityCSVArgs
  ): Promise<Community> {
    return new BloomManager().communityRepo().importCSVDataToCommunity(args);
  }
}
