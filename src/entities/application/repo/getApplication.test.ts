import faker from 'faker';
import { NotFoundError } from 'mikro-orm';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { QueryEvent } from '@util/constants.events';
import { initIntegrationTest } from '@util/test.util';
import Application from '../Application';
import getApplication from './getApplication';

initIntegrationTest();

/**
 * Creates a random Application.
 */
const seedApplication = async () => {
  const bm = new BloomManager();

  const community: Community = bm.create(Community, {
    name: faker.random.word(),
    primaryColor: faker.commerce.color(),
    urlName: faker.random.word()
  });

  const application: Application = bm.create(Application, {
    community,
    description: faker.random.words(50),
    id: '1',
    title: faker.random.words(3)
  });

  await bm.flush();
  return application;
};

describe(`getApplication()`, () => {
  test('Application found in database.', async () => {
    const application: Application = await seedApplication();
    const communityId: string = application.community.id;
    const cacheKey: string = `${QueryEvent.GET_APPLICATION}-${communityId}`;
    expect(Application.cache.get(cacheKey)).toBeUndefined();

    const fetchedApplication: Application = await getApplication({
      communityId
    });

    expect(fetchedApplication.id).toBe(application.id);
    expect(Application.cache.get(cacheKey)).toEqual(fetchedApplication);
  });

  test('Application found in cache.', async () => {
    const application: Application = await seedApplication();
    const communityId: string = application.community.id;
    const cacheKey: string = `${QueryEvent.GET_APPLICATION}-${communityId}`;
    expect(Application.cache.get(cacheKey)).toBeUndefined();
    Application.cache.set(cacheKey, application);
    expect(Application.cache.get(cacheKey)).toBeDefined();
    await getApplication({ communityId });
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
