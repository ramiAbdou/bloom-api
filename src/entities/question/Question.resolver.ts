import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import { GQLContext } from '@util/constants';
import Question from './Question';
import getQuestions from './repo/getQuestions';
import updateQuestion, { UpdateQuestionArgs } from './repo/updateQuestion';

@Resolver()
export default class QuestionResolver {
  @Query(() => [Question])
  async getQuestions(@Ctx() ctx: GQLContext): Promise<Question[]> {
    return getQuestions(ctx);
  }

  @Authorized(MemberRole.ADMIN)
  @Mutation(() => Question)
  async updateQuestion(@Args() args: UpdateQuestionArgs): Promise<Question> {
    return updateQuestion(args);
  }
}
