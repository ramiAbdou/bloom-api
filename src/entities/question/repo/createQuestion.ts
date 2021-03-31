import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import Question, { QuestionCategory, QuestionType } from '../Question';

@ArgsType()
export class CreateQuestionArgs {
  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  category?: QuestionCategory;

  @Field({ nullable: true })
  description?: string;

  @Field({ defaultValue: false })
  locked: boolean = false;

  @Field(() => [String], { nullable: true })
  options?: string[];

  @Field({ nullable: true })
  rank?: number;

  @Field()
  required: boolean = true;

  @Field(() => String, { nullable: true })
  type: QuestionType;
}

/**
 * Returns a new Question.
 *
 * @param args - Question data (eg: title, category, description).
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const createQuestion = async (
  args: CreateQuestionArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Question> => {
  const { communityId } = ctx;
  const { ...questionData } = args;

  const question: Question = await new BloomManager().createAndFlush(Question, {
    ...questionData,
    community: communityId
  });

  return question;
};

export default createQuestion;
