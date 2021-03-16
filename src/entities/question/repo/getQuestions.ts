import { QueryOrder } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import Question from '../Question';

/**
 * Returns the Question(s).
 *
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const getQuestions = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Question[]> => {
  const { communityId } = ctx;

  const questions: Question[] = await new BloomManager().find(
    Question,
    { community: communityId },
    {
      cacheKey: `${QueryEvent.GET_QUESTIONS}-${communityId}`,
      orderBy: { createdAt: QueryOrder.ASC, rank: QueryOrder.ASC }
    }
  );

  return questions;
};

export default getQuestions;
