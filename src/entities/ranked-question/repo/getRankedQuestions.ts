import { ArgsType, Field } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import RankedQuestion from '../RankedQuestion';

@ArgsType()
export class GetRankedQuestionsArgs {
  @Field({ nullable: true })
  urlName?: string;
}

const getRankedQuestions = async (
  args: GetRankedQuestionsArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<RankedQuestion[]> => {
  const key = args.urlName ?? ctx.communityId;

  const rankedQuestions: RankedQuestion[] = await new BloomManager().find(
    RankedQuestion,
    {
      application: {
        community: args.urlName ? { urlName: args.urlName } : ctx.communityId
      }
    },
    {
      cacheKey: `${QueryEvent.GET_APPLICATION_QUESTIONS}-${key}`,
      orderBy: { createdAt: QueryOrder.ASC },
      populate: ['question']
    }
  );

  return rankedQuestions;
};

export default getRankedQuestions;
