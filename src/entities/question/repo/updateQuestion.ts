import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { MutationEvent } from '@util/events';
import Question from '../Question';

@ArgsType()
export class UpdateQuestionArgs {
  @Field()
  questionId: string;

  @Field()
  title: string;
}

const updateQuestion = async ({ questionId, ...args }: UpdateQuestionArgs) => {
  return new BloomManager().findOneAndUpdate(
    Question,
    { id: questionId },
    { ...args },
    { flushEvent: MutationEvent.UPDATE_QUESTION }
  );
};

export default updateQuestion;
