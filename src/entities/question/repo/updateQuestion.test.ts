/**
 * @group integration
 */

import faker from 'faker';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { QueryEvent } from '@util/constants.events';
import {
  communityFactory,
  initDatabaseIntegrationTest,
  questionFactory
} from '@util/test.util';
import Question from '../Question';
import listQuestions from './listQuestions';
import updateQuestion, { UpdateQuestionArgs } from './updateQuestion';

const QUESTIONS_COUNT: number = 5;

describe('updateQuestion()', () => {
  let testStore: {
    cacheKey: string;
    communityId: string;
    questions: Question[];
  };

  initDatabaseIntegrationTest({
    beforeEach: async () => {
      const bm: BloomManager = new BloomManager();

      const community: Community = bm.create(
        Community,
        communityFactory.build()
      );

      const questions: Question[] = questionFactory
        .buildList(QUESTIONS_COUNT)
        .map((questionData: Partial<Question>) =>
          bm.create(Question, { ...questionData, community })
        );

      await bm.flush();

      testStore = {
        ...testStore,
        cacheKey: `${QueryEvent.LIST_QUESTIONS}-${community.id}`,
        communityId: community.id,
        questions
      };
    }
  });

  test('Should update the Question with the updated data.', async () => {
    const updateArgs: UpdateQuestionArgs = {
      questionId: testStore.questions[0].id,
      title: faker.random.words(5)
    };

    const updatedQuestion: Question = await updateQuestion(updateArgs);

    expect(updatedQuestion)
      .toHaveProperty('id', updateArgs.questionId)
      .toHaveProperty('title', updateArgs.title);
  });

  test('Should invalidate QueryEvent.LIST_QUESTIONS in Question cache.', async () => {
    const updateArgs: UpdateQuestionArgs = {
      questionId: testStore.questions[0].id,
      title: faker.random.words(5)
    };

    await listQuestions({ communityId: testStore.communityId });
    expect(Question.cache.has(testStore.cacheKey)).toBe(true);
    await updateQuestion(updateArgs);
    expect(Question.cache.has(testStore.cacheKey)).toBe(false);
  });
});
