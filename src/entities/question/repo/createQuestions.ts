import { ArgsType, Field } from 'type-graphql';
import { EntityData } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import Community from '../../community/Community';
import Question from '../Question';

@ArgsType()
export class CreateQuestionsArgs {
  @Field()
  highlightedQuestionTitle: string;

  @Field(() => [Question])
  questions: EntityData<Question>[];
}

const createQuestions = async (
  {
    highlightedQuestionTitle,
    questions: initialQuestions
  }: CreateQuestionsArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
): Promise<Question[]> => {
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

  await bm.flush({ flushEvent: FlushEvent.CREATE_QUESTIONS });

  return questions;
};

export default createQuestions;
