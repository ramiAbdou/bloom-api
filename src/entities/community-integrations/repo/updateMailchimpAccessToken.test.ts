/**
 * @group integration
 */

import faker from 'faker';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { QueryEvent } from '@util/constants.events';
import {
  communityFactory,
  communityIntegrationsFactory,
  initDatabaseIntegrationTest
} from '@util/test.util';
import CommunityIntegrations from '../CommunityIntegrations';
import updateMailchimpAccessToken from './updateMailchimpAccessToken';

describe('updateMailchimpAccessToken()', () => {
  let integrations: CommunityIntegrations;
  let communityId: string;

  initDatabaseIntegrationTest({
    beforeEach: async () => {
      const bm: BloomManager = new BloomManager();

      integrations = await bm.createAndFlush(CommunityIntegrations, {
        ...communityIntegrationsFactory.build(),
        community: bm.create(Community, communityFactory.build())
      });

      communityId = integrations.community.id;
    }
  });

  test('Should update the CommunityIntegrations with the mailchimpAccessToken.', async () => {
    const mailchimpAccessToken: string = faker.random.uuid();

    const actualResult = await updateMailchimpAccessToken({
      mailchimpAccessToken,
      urlName: integrations.community.urlName
    });

    expect(actualResult.mailchimpAccessToken).toBe(mailchimpAccessToken);
  });

  test('Should remove the QueryEvent.GET_COMMUNITY_INTEGRATIONS key CommunityIntegrations cache after updating the mailchimpAccessToken.', async () => {
    const mailchimpAccessToken: string = faker.random.uuid();

    const cacheKey: string = `${QueryEvent.GET_COMMUNITY_INTEGRATIONS}-${communityId}`;

    CommunityIntegrations.cache.set(cacheKey, integrations);

    await updateMailchimpAccessToken({
      mailchimpAccessToken,
      urlName: integrations.community.urlName
    });

    expect(CommunityIntegrations.cache.has(cacheKey)).toBe(false);
  });
});
