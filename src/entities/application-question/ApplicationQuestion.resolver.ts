import { Args, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import ApplicationQuestion from './ApplicationQuestion';
import getApplicationQuestions, {
  GetApplicationQuestionsArgs
} from './repo/getApplicationQuestions';

@Resolver()
export default class ApplicationQuestionResolver {
  @Query(() => [ApplicationQuestion])
  async getApplicationQuestions(
    @Args() args: GetApplicationQuestionsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<ApplicationQuestion[]> {
    return getApplicationQuestions(args, ctx);
  }
}
