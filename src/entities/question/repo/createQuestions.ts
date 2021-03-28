import { ArgsType, Field } from 'type-graphql';
import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { GQLContext } from '@util/constants';
import Question from '../Question';

@ArgsType()
export class CreateQuestionsArgs {
  @Field()
  highlightedQuestionTitle: string;

  @Field(() => [Question])
  questions: EntityData<Question>[];
}

/**
 * Returns the nenw Question(s).
 *
 * @param args.highlightedQuestionTitle - Title of highlighted Question.
 * @param args.questions - Question(s) data.
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const createQuestions = async (
  args: CreateQuestionsArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Question[]> => {
  const { highlightedQuestionTitle, questions: initialQuestions } = args;
  const { communityId } = ctx;

  const bm: BloomManager = new BloomManager();
  const community: Community = await bm.findOne(Community, communityId);

  let highlightedQuestion: Question;

  const questions: Question[] = initialQuestions.map(
    (questionData: EntityData<Question>) => {
      const question: Question = bm.create(Question, {
        ...questionData,
        community: communityId
      });

      if (question.title === highlightedQuestionTitle) {
        highlightedQuestion = question;
      }

      return question;
    }
  );

  if (highlightedQuestion) community.highlightedQuestion = highlightedQuestion;

  await bm.flush();

  return questions;
};

export default createQuestions;
