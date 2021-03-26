import { Args, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import RankedQuestion from './RankedQuestion';
import listRankedQuestions, {
  ListRankedQuestionsArgs
} from './repo/listRankedQuestions';

@Resolver()
export default class RankedQuestionResolver {
  @Query(() => [RankedQuestion])
  async listRankedQuestions(
    @Args() args: ListRankedQuestionsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<RankedQuestion[]> {
    return listRankedQuestions(args, ctx);
  }
}
