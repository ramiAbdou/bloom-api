/**
 * @group integration
 */

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import Question from '@entities/question/Question';
import { QueryEvent } from '@util/constants.events';
import {
  communityFactory,
  initDatabaseIntegrationTest,
  questionFactory
} from '@util/test.util';
import listQuestions from './listQuestions';

const QUESTIONS_COUNT: number = 5;

describe(`listQuestions()`, () => {
  let testStore: { cacheKey: string; communityId: string };

  initDatabaseIntegrationTest({
    beforeEach: async () => {
      const bm: BloomManager = new BloomManager();

      const community: Community = bm.create(
        Community,
        communityFactory.build()
      );

      questionFactory
        .buildList(QUESTIONS_COUNT)
        .map((questionData: Partial<Question>) =>
          bm.create(Question, { ...questionData, community })
        );

      await bm.flush();

      testStore = {
        ...testStore,
        cacheKey: `${QueryEvent.LIST_QUESTIONS}-${community.id}`,
        communityId: community.id
      };
    }
  });

  test('Should add the Question(s) to cache after query.', async () => {
    const { cacheKey, communityId } = testStore;

    const actualResult: Question[] = await listQuestions({ communityId });

    expect(Question.cache.get(cacheKey))
      .toBeDefined()
      .toHaveLength(QUESTIONS_COUNT)
      .toEqual(actualResult);
  });

  test('Should be sorted by "rank" in ascending order.', async () => {
    const { communityId } = testStore;

    const actualResult: Question[] = await listQuestions({ communityId });

    expect(actualResult)
      .toBeDefined()
      .toHaveLength(QUESTIONS_COUNT)
      .toBeSortedBy('rank', { descending: false });
  });
});
