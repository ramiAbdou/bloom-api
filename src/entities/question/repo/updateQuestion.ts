import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { cleanObject } from '@util/util';
import Question from '../Question';

@ArgsType()
export class UpdateQuestionArgs {
  @Field()
  questionId: string;

  @Field()
  title: string;
}

/**
 * Returns the updated Question.
 *
 * @param args.questionId - ID of the Question to update.
 * @param args.title - Title to change the Question to.
 */
const updateQuestion = async (args: UpdateQuestionArgs): Promise<Question> => {
  const { questionId, ...questionData } = args;

  const question: Question = await new BloomManager().findOneAndUpdate(
    Question,
    { id: questionId },
    cleanObject(questionData)
  );

  return question;
};

export default updateQuestion;
