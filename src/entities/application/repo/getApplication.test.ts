/**
 * @group integration
 */

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { QueryEvent } from '@util/constants.events';
import {
  buildApplications,
  buildCommunities,
  initDatabaseIntegrationTest
} from '@util/test.util';
import Application from '../Application';
import getApplication from './getApplication';

describe(`getApplication()`, () => {
  let application: Application;
  let communityId: string;
  let cacheKey: string;

  initDatabaseIntegrationTest({
    beforeEach: async () => {
      const bm: BloomManager = new BloomManager();

      application = await bm.createAndFlush(Application, {
        ...buildApplications()[0],
        community: bm.create(Community, buildCommunities()[0])
      });

      communityId = application.community.id;
      cacheKey = `${QueryEvent.GET_APPLICATION}-${communityId}`;
    }
  });

  test('Should add Application to cache after query.', async () => {
    const actualResult: Application = await getApplication({ communityId });
    expect(Application.cache.get(cacheKey)).toEqual(actualResult);
  });

  test('Should use args.communityId to query the Application.', async () => {
    const spyFindOneOrFail = jest.spyOn(
      BloomManager.prototype,
      'findOneOrFail'
    );

    const actualResult: Application = await getApplication({ communityId });

    const whereArg = spyFindOneOrFail.mock.calls[0][1];

    expect(whereArg).toEqual({ community: communityId });
    expect(actualResult.id).toBe(application.id);
    expect(actualResult).toEqual(Application.cache.get(cacheKey));
  });

  test('If Application is not found, should throw a NotFoundError.', async () => {
    expect.assertions(1);

    try {
      await getApplication({ communityId: null });
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});
