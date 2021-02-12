import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import Question from './Question';
import getQuestions, { GetQuestionsArgs } from './repo/getQuestions';
import updateQuestion, { UpdateQuestionArgs } from './repo/updateQuestion';

@Resolver()
export default class QuestionResolver {
  @Query(() => [Question])
  async getQuestions(
    @Args() args: GetQuestionsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Question[]> {
    return getQuestions(args, ctx);
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
