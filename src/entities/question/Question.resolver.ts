import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { FilterQuery, QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { UrlNameArgs } from '../../util/gql.types';
import Community from '../community/Community';
import Question from './Question';
import updateQuestion, { UpdateQuestionArgs } from './repo/updateQuestion';

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

    const key = urlName ?? communityId;

    return new BloomManager().find(
      Question,
      { community: args },
      {
        cacheKey: `${QueryEvent.GET_QUESTIONS}-${key}`,
        orderBy: { createdAt: QueryOrder.ASC, order: QueryOrder.ASC }
      }
    );
  }

  @Authorized('ADMIN')
  @Mutation(() => Question, { nullable: true })
  async updateQuestion(
    @Args() args: UpdateQuestionArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Question> {
    return updateQuestion(args, ctx);
  }
}
