import { Args, Authorized, Mutation, Resolver } from 'type-graphql';

import { MemberRole } from '@entities/member/Member';
import Question from './Question';
import updateQuestion, { UpdateQuestionArgs } from './repo/updateQuestion';

@Resolver()
export default class QuestionResolver {
  @Authorized(MemberRole.ADMIN)
  @Mutation(() => Question)
  async updateQuestion(@Args() args: UpdateQuestionArgs): Promise<Question> {
    return updateQuestion(args);
  }
}
