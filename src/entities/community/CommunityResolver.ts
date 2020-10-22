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
  ImportCommunityCSVArgs,
  ReorderQuestionArgs
} from './CommunityArgs';

@Resolver()
export default class CommunityResolver {
  @Mutation(() => Community, { nullable: true })
  async createCommunity(@Args() args: CreateCommunityArgs): Promise<Community> {
    const bm = new BloomManager();
    // const dateJoinedQuestion = bm.membershipQuestionRepo().create({
    //   category: 'DATE_JOINED',

    //   title: 'Date Joined',
    //   type: 'SHORT_TEXT'
    // });
    return bm.communityRepo().createCommunity(args);
  }

  @Query(() => Community, { nullable: true })
  async getCommunity(
    @Args() { encodedUrlName }: GetCommunityArgs,
    @Populate() populate: string[]
  ): Promise<Community> {
    populate = populate.reduce((acc, value) => {
      if (value !== 'application.questions') return [...acc, value];
      return [...acc, 'application', 'questions'];
    }, []);

    return new BloomManager()
      .communityRepo()
      .findOne({ encodedUrlName }, populate);
  }

  @Mutation(() => Community, { nullable: true })
  async importCSVDataToCommunity(
    @Args() args: ImportCommunityCSVArgs
  ): Promise<Community> {
    return new BloomManager().communityRepo().importCSVDataToCommunity(args);
  }

  @Mutation(() => Community, { nullable: true })
  async reorderQuestion(@Args() args: ReorderQuestionArgs): Promise<Community> {
    return new BloomManager().communityRepo().reorderQuestion(args);
  }
}
