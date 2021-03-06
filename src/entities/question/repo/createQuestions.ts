import { ArgsType, Field } from 'type-graphql';
import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';
import Question from '../Question';

@ArgsType()
export class CreateQuestionsArgs {
  @Field()
  highlightedQuestionTitle: string;

  @Field(() => [Question])
  questions: EntityData<Question>[];
}

const createQuestions = async (
  args: CreateQuestionsArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<Question[]> => {
  const { highlightedQuestionTitle, questions: initialQuestions } = args;
  const { communityId } = ctx;

  const bm = new BloomManager();
  const community: Community = await bm.findOne(Community, { id: communityId });

  let highlightedQuestion: Question;

  const questions: Question[] = initialQuestions.map(
    (question: EntityData<Question>) => {
      const persistedQuestion: Question = bm.create(Question, {
        ...question,
        community: communityId
      });

      if (persistedQuestion.title === highlightedQuestionTitle) {
        highlightedQuestion = persistedQuestion;
      }

      return persistedQuestion;
    }
  );

  if (highlightedQuestion) community.highlightedQuestion = highlightedQuestion;

  await bm.flush({ flushEvent: MutationEvent.CREATE_QUESTIONS });

  return questions;
};

export default createQuestions;
