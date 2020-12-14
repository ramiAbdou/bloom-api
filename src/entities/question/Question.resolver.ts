import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import Question from './Question';
import renameQuestion, { RenameQuestionArgs } from './repo/renameQuestion';

@Resolver()
export default class QuestionResolver {
  @Authorized('ADMIN')
  @Mutation(() => Question, { nullable: true })
  async renameQuestion(
    @Args() args: RenameQuestionArgs,
    @Ctx() ctx: GQLContext
  ): Promise<Question> {
    return renameQuestion(args, ctx);
  }
}
