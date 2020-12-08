import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Question from './Question';
import { RenameQuestionArgs } from './Question.args';

@Resolver()
export default class QuestionResolver {
  @Authorized('ADMIN')
  @Mutation(() => Question, { nullable: true })
  async renameQuestion(
    @Args() { id, title, version }: RenameQuestionArgs,
    @Ctx() { communityId }: GQLContext
  ): Promise<Question> {
    return new BloomManager()
      .questionRepo()
      .renameQuestion(id, title, version, communityId);
  }
}
