/**
 * @group integration
 */

import faker from 'faker';

import Community from '@entities/community/Community';
import { QueryEvent } from '@util/constants.events';
import {
  buildCommunityIntegrations,
  initDatabaseIntegrationTest
} from '@util/test.util';
import CommunityIntegrations from '../CommunityIntegrations';
import updateMailchimpAccessToken from './updateMailchimpAccessToken';

describe('updateMailchimpAccessToken()', () => {
  initDatabaseIntegrationTest([Community, CommunityIntegrations]);

  test('Should update the CommunityIntegrations with the mailchimpAccessToken.', async () => {
    const integrations = await buildCommunityIntegrations();
    const mailchimpAccessToken: string = faker.random.uuid();

    const actualResult = await updateMailchimpAccessToken({
      mailchimpAccessToken,
      urlName: integrations.community.urlName
    });

    expect(actualResult.mailchimpAccessToken).toBe(mailchimpAccessToken);
  });

  test('Should remove the QueryEvent.GET_COMMUNITY_INTEGRATIONS key CommunityIntegrations cache after updating the mailchimpAccessToken.', async () => {
    const integrations = await buildCommunityIntegrations();
    const communityId: string = integrations.community.id;
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
