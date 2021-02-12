import { ArgsType, Field } from 'type-graphql';
import { FilterQuery, QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Question from '../Question';

@ArgsType()
export class GetQuestionsArgs {
  @Field({ nullable: true })
  urlName?: string;
}

const getQuestions = async (
  { urlName }: GetQuestionsArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
) => {
  const args: FilterQuery<Question> = urlName
    ? { community: { urlName } }
    : { community: { id: communityId } };

  const key = urlName ?? communityId;

  return new BloomManager().find(
    Question,
    { ...args },
    {
      cacheKey: `${QueryEvent.GET_QUESTIONS}-${key}`,
      orderBy: { createdAt: QueryOrder.ASC, order: QueryOrder.ASC }
    }
  );
};

export default getQuestions;
