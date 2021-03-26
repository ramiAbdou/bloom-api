/**
 * @group integration
 */

import faker from 'faker';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import * as emitEmailEvent from '@system/events/repo/emitEmailEvent';
import { IntegrationsBrand } from '@util/constants';
import { EmailEvent, QueryEvent } from '@util/constants.events';
import {
  communityFactory,
  communityIntegrationsFactory,
  initDatabaseIntegrationTest
} from '@util/test.util';
import CommunityIntegrations from '../CommunityIntegrations';
import updateStripeAccountId from './updateStripeAccountId';

describe('updateStripeAccountId()', () => {
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

  test('Should update the CommunityIntegrations with the stripeAccountId.', async () => {
    const stripeAccountId: string = faker.random.uuid();

    const actualResult: CommunityIntegrations = await updateStripeAccountId({
      stripeAccountId,
      urlName: integrations.community.urlName
    });

    expect(actualResult.stripeAccountId).toBe(stripeAccountId);
  });

  test(`Should remove the QueryEvent.GET_COMMUNITY_INTEGRATIONS key from the CommunityIntegrations cache after updating the stripeAccountId.`, async () => {
    CommunityIntegrations.cache.set(cacheKey, integrations);

    await updateStripeAccountId({
      stripeAccountId: faker.random.uuid(),
      urlName: integrations.community.urlName
    });

    expect(CommunityIntegrations.cache.has(cacheKey)).toBe(false);
  });

  test('Should emit a CONNECT_INTEGRATIONS email.', async () => {
    const spyEmitEmailEvent = jest
      .spyOn(emitEmailEvent, 'default')
      .mockImplementation();

    await updateStripeAccountId({
      stripeAccountId: faker.random.uuid(),
      urlName: integrations.community.urlName
    });

    expect(spyEmitEmailEvent)
      .toBeCalledTimes(1)
      .toBeCalledWith(EmailEvent.CONNECT_INTEGRATIONS, {
        brand: IntegrationsBrand.STRIPE,
        urlName: integrations.community.urlName
      });
  });
});
