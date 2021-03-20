/**
 * @group integration
 */

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { QueryEvent } from '@util/constants.events';
import { buildApplication, initDatabaseIntegrationTest } from '@util/test.util';
import Application from '../Application';
import getApplication from './getApplication';

describe(`getApplication()`, () => {
  initDatabaseIntegrationTest([Application, Community]);

  test('Should add Application to cache after query.', async () => {
    const application: Application = await buildApplication();
    const communityId: string = application.community.id;
    const cacheKey: string = `${QueryEvent.GET_APPLICATION}-${communityId}`;

    const actualResult: Application = await getApplication({ communityId });
    expect(Application.cache.get(cacheKey)).toEqual(actualResult);
  });

  test('Should use args.communityId to query the Application.', async () => {
    const application: Application = await buildApplication();
    const communityId: string = application.community.id;

    const spyFindOneOrFail = jest.spyOn(
      BloomManager.prototype,
      'findOneOrFail'
    );

    const actualResult: Application = await getApplication({ communityId });

    const whereArg = spyFindOneOrFail.mock.calls[0][1];
    const cacheKey: string = `${QueryEvent.GET_APPLICATION}-${communityId}`;

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
