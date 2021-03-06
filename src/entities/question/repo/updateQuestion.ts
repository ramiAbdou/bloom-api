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

const updateQuestion = async (args: UpdateQuestionArgs): Promise<Question> => {
  const { questionId, ...questionData } = args;

  const question: Question = await new BloomManager().findOneAndUpdate(
    Question,
    questionId,
    { ...questionData },
    { flushEvent: MutationEvent.UPDATE_QUESTION }
  );

  return question;
};

export default updateQuestion;
