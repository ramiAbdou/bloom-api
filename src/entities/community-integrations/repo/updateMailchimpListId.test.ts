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
import updateMailchimpListId from './updateMailchimpListId';

describe('updateMailchimpListId()', () => {
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

  test('Should update the CommunityIntegrations with the mailchimpListId.', async () => {
    const mailchimpListId: string = faker.random.uuid();

    const actualResult: CommunityIntegrations = await updateMailchimpListId(
      { mailchimpListId },
      { communityId }
    );

    expect(actualResult.mailchimpListId).toBe(mailchimpListId);
  });

  test(`Should remove the QueryEvent.GET_COMMUNITY_INTEGRATIONS key from the CommunityIntegrations cache after updating the mailchimpListId.`, async () => {
    const mailchimpListId: string = faker.random.uuid();
    CommunityIntegrations.cache.set(cacheKey, integrations);
    await updateMailchimpListId({ mailchimpListId }, { communityId });
    expect(CommunityIntegrations.cache.has(cacheKey)).toBe(false);
  });

  test('Should emit a CONNECT_INTEGRATIONS email.', async () => {
    const mailchimpListId: string = faker.random.uuid();

    const spyEmitEmailEvent = jest
      .spyOn(emitEmailEvent, 'default')
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
