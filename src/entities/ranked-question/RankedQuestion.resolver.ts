import { Args, Ctx, Query, Resolver } from 'type-graphql';

import { GQLContext } from '@util/constants';
import RankedQuestion from './RankedQuestion';
import getRankedQuestions, {
  GetRankedQuestionsArgs
} from './repo/getRankedQuestions';

@Resolver()
export default class RankedQuestionResolver {
  @Query(() => [RankedQuestion])
  async getRankedQuestions(
    @Args() args: GetRankedQuestionsArgs,
    @Ctx() ctx: GQLContext
  ): Promise<RankedQuestion[]> {
    return getRankedQuestions(args, ctx);
  }
}
