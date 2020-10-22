/**
 * @fileoverview Resolver: Community
 * @author Rami Abdou
 */

import { Args, Mutation, Query, Resolver } from 'type-graphql';

import { Community } from '@entities';
import BloomManager from '@util/db/BloomManager';
import { Populate } from '@util/gql';
import {
  GetCommunityArgs,
  ImportCommunityCSVArgs,
  ReorderQuestionArgs
} from './CommunityArgs';

@Resolver()
export default class CommunityResolver {
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
