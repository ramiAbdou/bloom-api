import { ArgsType, Field } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import RankedQuestion from '../RankedQuestion';

@ArgsType()
export class ListRankedQuestionsArgs {
  @Field({ nullable: true })
  communityId?: string;
}

/**
 * Returns the RankedQuestion(s).
 *
 * @param args.communityId - ID of the Community.
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const listRankedQuestions = async (
  args: ListRankedQuestionsArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<RankedQuestion[]> => {
  const communityId: string = args.communityId ?? ctx.communityId;

  const rankedQuestions: RankedQuestion[] = await new BloomManager().find(
    RankedQuestion,
    { application: { community: communityId } },
    {
      cacheKey: `${QueryEvent.LIST_RANKED_QUESTIONS}-${communityId}`,
      orderBy: { createdAt: QueryOrder.ASC },
      populate: ['question']
    }
  );

  return rankedQuestions;
};

export default listRankedQuestions;
