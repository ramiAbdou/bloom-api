/**
 * @group integration
 */

import faker from 'faker';

import Community from '@entities/community/Community';
import * as eventBus from '@system/eventBus';
import { IntegrationsBrand } from '@util/constants';
import { EmailEvent, QueryEvent } from '@util/constants.events';
import {
  buildCommunityIntegrations,
  initDatabaseIntegrationTest
} from '@util/test.util';
import CommunityIntegrations from '../CommunityIntegrations';
import updateStripeAccountId from './updateStripeAccountId';

describe('updateStripeAccountId()', () => {
  initDatabaseIntegrationTest([Community, CommunityIntegrations]);

  test('Should update the CommunityIntegrations with the stripeAccountId.', async () => {
    const integrations = await buildCommunityIntegrations();
    const stripeAccountId: string = faker.random.uuid();

    const actualResult: CommunityIntegrations = await updateStripeAccountId({
      stripeAccountId,
      urlName: integrations.community.urlName
    });

    expect(actualResult.stripeAccountId).toBe(stripeAccountId);
  });

  test(`Should remove the QueryEvent.GET_COMMUNITY_INTEGRATIONS key from the CommunityIntegrations cache after updating the stripeAccountId.`, async () => {
    const integrations = await buildCommunityIntegrations();
    const cacheKey: string = `${QueryEvent.GET_COMMUNITY_INTEGRATIONS}-${integrations.community.id}`;

    CommunityIntegrations.cache.set(cacheKey, integrations);

    await updateStripeAccountId({
      stripeAccountId: faker.random.uuid(),
      urlName: integrations.community.urlName
    });

    expect(CommunityIntegrations.cache.has(cacheKey)).toBe(false);
  });

  test('Should emit a CONNECT_INTEGRATIONS email.', async () => {
    const integrations = await buildCommunityIntegrations();

    const spyEmitEmailEvent = jest
      .spyOn(eventBus, 'emitEmailEvent')
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
