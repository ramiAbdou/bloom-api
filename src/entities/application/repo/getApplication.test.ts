import { NotFoundError } from 'mikro-orm';

import { QueryEvent } from '@util/constants.events';
import { buildApplication, initIntegrationTest } from '@util/test.util';
import Application from '../Application';
import getApplication from './getApplication';

initIntegrationTest();

describe(`getApplication()`, () => {
  test('Application found in database.', async () => {
    const application: Application = await buildApplication();
    const communityId: string = application.community.id;
    const cacheKey: string = `${QueryEvent.GET_APPLICATION}-${communityId}`;

    // Cache shouldn't have key at this point.
    expect(Application.cache.get(cacheKey)).toBeUndefined();

    const fetchedApplication: Application = await getApplication({
      communityId
    });

    expect(fetchedApplication.id).toBe(application.id);

    // Cache should now be populated.
    expect(Application.cache.get(cacheKey)).toEqual(fetchedApplication);
  });

  test('Application found in cache.', async () => {
    const application: Application = await buildApplication();
    const communityId: string = application.community.id;
    const cacheKey: string = `${QueryEvent.GET_APPLICATION}-${communityId}`;

    // Cache shouldn't have key at this point.
    expect(Application.cache.get(cacheKey)).toBeUndefined();

    // Set the cache key.
    Application.cache.set(cacheKey, application);

    expect(await getApplication({ communityId })).toEqual(
      Application.cache.get(cacheKey)
    );
  });

  test('Application not found.', async () => {
    expect.assertions(1);

    try {
      await getApplication({ communityId: null });
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundError);
    }
  });
});
