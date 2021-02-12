import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Question from '../Question';

@ArgsType()
export class UpdateQuestionArgs {
  @Field()
  questionId: string;

  @Field()
  title: string;
}

const updateQuestion = async (
  { questionId, ...args }: UpdateQuestionArgs,
  { communityId }: GQLContext
) => {
  return new BloomManager().findOneAndUpdate(
    Question,
    { id: questionId },
    { ...args },
    {
      cacheKeysToInvalidate: [`${QueryEvent.GET_QUESTIONS}-${communityId}`],
      event: 'UPDATE_QUESTION'
    }
  );
};

export default updateQuestion;
