import { NotFoundError } from 'mikro-orm';

import { QueryEvent } from '@util/constants.events';
import { buildApplication, initDatabaseIntegrationTest } from '@util/test.util';
import Application from '../Application';
import getApplication from './getApplication';

initDatabaseIntegrationTest();

describe(`getApplication()`, () => {
  test('Application found - args.communityId.', async () => {
    const application: Application = await buildApplication();
    const communityId: string = application.community.id;
    const cacheKey: string = `${QueryEvent.GET_APPLICATION}-${communityId}`;

    expect(Application.cache.get(cacheKey)).toBeUndefined();

    const actualResult: Application = await getApplication({ communityId });

    expect(actualResult.id).toBe(application.id);
    expect(actualResult).toEqual(Application.cache.get(cacheKey));
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
