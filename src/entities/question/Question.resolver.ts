import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import Question from './Question';
import createQuestion, { CreateQuestionArgs } from './repo/createQuestion';
import deleteQuestion, { DeleteQuestionArgs } from './repo/deleteQuestion';
import listQuestions from './repo/listQuestions';
import updateQuestion, { UpdateQuestionArgs } from './repo/updateQuestion';

@Resolver()
export default class QuestionResolver {
  @Query(() => [Question])
  async listQuestions(@Ctx() ctx: GQLContext): Promise<Question[]> {
    return listQuestions(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => Question, { nullable: true })
  async createQuestion(
    @Args() args: CreateQuestionArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Question> {
    return createQuestion(args, ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => Question)
  async deleteQuestion(@Args() args: DeleteQuestionArgs): Promise<Question> {
    return deleteQuestion(args);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => Question)
  async updateQuestion(@Args() args: UpdateQuestionArgs): Promise<Question> {
    return updateQuestion(args);
  }
}
