/**
 * @group integration
 */

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { QueryEvent } from '@util/constants.events';
import {
  communityFactory,
  communityIntegrationsFactory,
  initDatabaseIntegrationTest
} from '@util/test.util';
import CommunityIntegrations from '../CommunityIntegrations';
import getCommunityIntegrations from './getCommunityIntegrations';

describe(`getCommunityIntegrations()`, () => {
  let integrations: CommunityIntegrations;
  let communityId: string;
  let cacheKey: string;

  initDatabaseIntegrationTest({
    beforeEach: async () => {
      const bm: BloomManager = new BloomManager();

      integrations = await bm.createAndFlush(CommunityIntegrations, {
        ...communityIntegrationsFactory.build(),
        community: bm.create(Community, communityFactory.build())
      });

      communityId = integrations.community.id;
      cacheKey = `${QueryEvent.GET_COMMUNITY_INTEGRATIONS}-${communityId}`;
    }
  });

  test('Should add CommunityIntegrations to cache after query.', async () => {
    const actualResult: CommunityIntegrations = await getCommunityIntegrations(
      {},
      { communityId }
    );

    expect(actualResult).toEqual(CommunityIntegrations.cache.get(cacheKey));
  });

  test('If args.communityId is supplied, should use that to query the CommunityIntegrations.', async () => {
    const spyFindOne = jest.spyOn(BloomManager.prototype, 'findOne');

    const actualResult: CommunityIntegrations = await getCommunityIntegrations(
      { communityId },
      { communityId: null }
    );

    const whereArg = spyFindOne.mock.calls[0][1];
    expect(whereArg).toEqual({ community: communityId });
    expect(actualResult).toEqual(CommunityIntegrations.cache.get(cacheKey));
  });

  test('If args.communityId is NOT supplied, should use ctx.communityId to query the CommunityIntegrations.', async () => {
    const spyFindOne = jest.spyOn(BloomManager.prototype, 'findOne');

    const actualResult: CommunityIntegrations = await getCommunityIntegrations(
      {},
      { communityId }
    );

    const whereArg = spyFindOne.mock.calls[0][1];
    expect(whereArg).toEqual({ community: communityId });
    expect(actualResult).toEqual(CommunityIntegrations.cache.get(cacheKey));
  });
});
