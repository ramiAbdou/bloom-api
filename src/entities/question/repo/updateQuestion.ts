import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { cleanObject } from '@util/util';
import Question, { QuestionCategory, QuestionType } from '../Question';

@ArgsType()
export class UpdateQuestionArgs {
  @Field()
  questionId: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  category?: QuestionCategory;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  options?: string[];

  @Field()
  required: boolean = true;

  @Field(() => String, { nullable: true })
  type: QuestionType;
}

/**
 * Returns the updated Question.
 *
 * @param args.questionId - ID of the Question to update.
 * @param args.title - Title to change the Question to.
 * @param args.category - Category of the Question to update.
 * @param args.description - Description of the Question to update.
 * @param args.options - Options of the Question to update.
 * @param args.required - Required status of the Question to update.
 * @param args.type - Type of the Queston to update.
 */
const updateQuestion = async (args: UpdateQuestionArgs): Promise<Question> => {
  const { questionId, ...questionData } = args;

  const question: Question = await new BloomManager().findOneAndUpdate(
    Question,
    questionId,
    cleanObject(questionData)
  );

  return question;
};

export default updateQuestion;
