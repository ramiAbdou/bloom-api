import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { UrlNameArgs } from '../../util/gql.types';
import Community from '../community/Community';
import Question from './Question';
import renameQuestion, { RenameQuestionArgs } from './repo/renameQuestion';

@Resolver()
export default class QuestionResolver {
  @Query(() => [Question])
  async getQuestions(
    @Args() { urlName }: UrlNameArgs,
    @Ctx() { communityId }: GQLContext
  ): Promise<Question[]> {
    const args: FilterQuery<Community> = urlName
      ? { urlName }
      : { id: communityId };

    return new BloomManager().find(
      Question,
      { community: args },
      {
        cacheKey: `${QueryEvent.GET_QUESTIONS}-${communityId}`,
        populate: ['community']
      }
    );
  }

  @Authorized('ADMIN')
  @Mutation(() => Question, { nullable: true })
  async renameQuestion(
    @Args() args: RenameQuestionArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Question> {
    return renameQuestion(args, ctx);
  }
}
