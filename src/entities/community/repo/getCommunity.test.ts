/**
 * @group integration
 */

import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/constants.events';
import { communityFactory, initDatabaseIntegrationTest } from '@util/test.util';
import Community from '../Community';
import getCommunity from './getCommunity';

describe(`getCommunity()`, () => {
  let community: Community;
  let communityId: string;
  let cacheKey: string;

  initDatabaseIntegrationTest({
    beforeEach: async () => {
      community = await new BloomManager().createAndFlush(
        Community,
        communityFactory.build()
      );

      communityId = community.id;
      cacheKey = `${QueryEvent.GET_COMMUNITY}-${communityId}`;
    }
  });

  test('Should add Community to cache after query.', async () => {
    const actualResult: Community = await getCommunity({}, { communityId });
    expect(actualResult).toEqual(Community.cache.get(cacheKey));
  });

  test('If args.urlName is supplied, should use that to query the Community.', async () => {
    const { urlName } = community;
    cacheKey = `${QueryEvent.GET_COMMUNITY}-${urlName}`;

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
    const spyFindOneOrFail = jest.spyOn(
      BloomManager.prototype,
      'findOneOrFail'
    );

    const actualResult: Community = await getCommunity({}, { communityId });

    const whereArg = spyFindOneOrFail.mock.calls[0][1];

    expect(whereArg).toStrictEqual({ id: communityId });
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
