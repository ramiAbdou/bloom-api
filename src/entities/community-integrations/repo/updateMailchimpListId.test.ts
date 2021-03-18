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
import updateMailchimpListId from './updateMailchimpListId';

describe('updateMailchimpListId()', () => {
  initDatabaseIntegrationTest([Community, CommunityIntegrations]);

  test('Should update the CommunityIntegrations with the mailchimpListId.', async () => {
    const integrations = await buildCommunityIntegrations();
    const communityId: string = integrations.community.id;
    const mailchimpListId: string = faker.random.uuid();

    const actualResult: CommunityIntegrations = await updateMailchimpListId(
      { mailchimpListId },
      { communityId }
    );

    expect(actualResult.mailchimpListId).toBe(mailchimpListId);
  });

  test(`Should remove the QueryEvent.GET_COMMUNITY_INTEGRATIONS key from the CommunityIntegrations cache after updating the mailchimpListId.`, async () => {
    const integrations = await buildCommunityIntegrations();
    const communityId: string = integrations.community.id;
    const mailchimpListId: string = faker.random.uuid();

    const cacheKey: string = `${QueryEvent.GET_COMMUNITY_INTEGRATIONS}-${communityId}`;

    CommunityIntegrations.cache.set(cacheKey, integrations);

    await updateMailchimpListId({ mailchimpListId }, { communityId });

    expect(CommunityIntegrations.cache.has(cacheKey)).toBe(false);
  });

  test('Should emit a CONNECT_INTEGRATIONS email.', async () => {
    const integrations = await buildCommunityIntegrations();
    const communityId: string = integrations.community.id;
    const mailchimpListId: string = faker.random.uuid();

    const spyEmitEmailEvent = jest
      .spyOn(eventBus, 'emitEmailEvent')
      .mockImplementation();

    await updateMailchimpListId(
      { mailchimpListId },
      { communityId: integrations.community.id }
    );

    expect(spyEmitEmailEvent).toBeCalledWith(EmailEvent.CONNECT_INTEGRATIONS, {
      brand: IntegrationsBrand.MAILCHIMP,
      communityId
    });
  });
});
