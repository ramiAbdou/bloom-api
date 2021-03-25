/**
 * @group integration
 */

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/constants.events';
import { buildCommunity, initDatabaseIntegrationTest } from '@util/test.util';
import Community from '../Community';
import getCommunity from './getCommunity';

describe(`getCommunity()`, () => {
  initDatabaseIntegrationTest();

  test('Should add Community to cache after query.', async () => {
    const community: Community = await buildCommunity();
    const communityId: string = community.id;
    const cacheKey: string = `${QueryEvent.GET_COMMUNITIES}-${communityId}`;

    const actualResult: Community = await getCommunity({}, { communityId });
    expect(actualResult).toEqual(Community.cache.get(cacheKey));
  });

  test('If args.urlName is supplied, should use that to query the Community.', async () => {
    const community: Community = await buildCommunity();
    const communityId: string = community.id;
    const { urlName } = community;
    const cacheKey: string = `${QueryEvent.GET_COMMUNITIES}-${urlName}`;

    const spyFindOneOrFail = jest.spyOn(
      BloomManager.prototype,
      'findOneOrFail'
    );

    const actualResult: Community = await getCommunity(
      { urlName },
      { communityId }
    );

    const whereArg = spyFindOneOrFail.mock.calls[0][1];
    expect(whereArg).toEqual({ urlName });
    expect(actualResult).toEqual(Community.cache.get(cacheKey));
  });

  test('If args.urlName is NOT supplied, should use ctx.communityId that to query the Community.', async () => {
    const community: Community = await buildCommunity();
    const cacheKey: string = `${QueryEvent.GET_COMMUNITIES}-${community.id}`;

    const spyFindOneOrFail = jest.spyOn(
      BloomManager.prototype,
      'findOneOrFail'
    );

    const actualResult: Community = await getCommunity(
      {},
      { communityId: community.id }
    );

    const whereArg = spyFindOneOrFail.mock.calls[0][1];

    expect(whereArg).toBe(community.id);
    expect(actualResult).toEqual(Community.cache.get(cacheKey));
  });

  test('If Community is not found, should throw a NotFoundError.', async () => {
    expect.assertions(1);

    try {
      await getCommunity({}, { communityId: null });
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});
