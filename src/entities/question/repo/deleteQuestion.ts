import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { now } from '@util/util';
import Question from '../Question';

@ArgsType()
export class DeleteQuestionArgs {
  @Field()
  questionId: string;
}

/**
 * Returns the soft-deleted Question.
 *
 * @param args.questionId - ID of the Question.
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const deleteQuestion = async (args: DeleteQuestionArgs): Promise<Question> => {
  const { questionId } = args;

  const question: Question = await new BloomManager().findOneAndUpdate(
    Question,
    questionId,
    { deletedAt: now() }
  );

  return question;
};

export default deleteQuestion;
