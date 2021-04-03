/**
 * @group integration
 */

import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import Community from '@entities/community/Community';
import MemberIntegrations from '@entities/member-integrations/MemberIntegrations';
import MemberType from '@entities/member-type/MemberType';
import Member from '@entities/member/Member';
import User from '@entities/user/User';
import * as createStripeSubscription from '@integrations/stripe/repo/createStripeSubscription';
import * as updateStripeSubscription from '@integrations/stripe/repo/updateStripeSubscription';
import {
  communityFactory,
  communityIntegrationsFactory,
  initDatabaseIntegrationTest,
  memberFactory,
  memberTypeFactory,
  userFactory
} from '@util/test.util';
import updateStripeSubscriptionId from './updateStripeSubscriptionId';

describe('updateStripeSubscriptionId()', () => {
  const mockedStripeSubcriptionId = '1';
  const mockedStripeAccountId = '10';

  let integrations: CommunityIntegrations;
  let communityId: string;
  let member: Member;
  let memberId: string;
  let memberTypes: MemberType[];
  let memberTypeId: string;

  initDatabaseIntegrationTest({
    beforeEach: async () => {
      const bm: BloomManager = new BloomManager();

      memberTypes = memberTypeFactory.buildList(3).map((data) => {
        return bm.create(MemberType, data);
      });

      const community: Community = bm.create(Community, {
        ...communityFactory.build(),
        memberTypes
      });

      member = bm.create(Member, {
        ...memberFactory.build(),
        community,
        memberIntegrations: bm.create(MemberIntegrations, {}),
        memberType: memberTypes[0],
        user: bm.create(User, userFactory.build())
      });

      integrations = bm.create(CommunityIntegrations, {
        ...communityIntegrationsFactory.build({
          stripeAccountId: mockedStripeAccountId
        }),
        community
      });

      await bm.flush();

      communityId = integrations.community.id;
      memberId = member.id;
      memberTypes = integrations.community.memberTypes.getItems();
      memberTypeId = integrations.community.memberTypes[0].id;
    }
  });

  test('If the MemberIntegrations does not have a stripeSubscriptionId, it should create a Stripe subscription.', async () => {
    const mockedCreateStripeSubscription = jest
      .spyOn(createStripeSubscription, 'default')
      .mockResolvedValue({
        id: mockedStripeSubcriptionId
      } as Stripe.Subscription);

    const updatedMemberIntegrations = await updateStripeSubscriptionId(
      { memberTypeId },
      { communityId, memberId }
    );

    expect(mockedCreateStripeSubscription)
      .toBeCalledTimes(1)
      .toBeCalledWith({
        stripeAccountId: mockedStripeAccountId,
        stripeCustomerId: null,
        stripePriceId: null
      } as createStripeSubscription.CreateStripeSubscriptionArgs);

    expect(updatedMemberIntegrations)
      .toHaveProperty('stripeSubscriptionId', mockedStripeSubcriptionId)
      .toHaveProperty('member.memberType.id', memberTypeId);
  });

  test('If the MemberIntegrations does have a stripeSubscriptionId, it should update the Stripe subscription (not stripeSubscriptionId) and update the MemberType of the Member.', async () => {
    const newMemberTypeId: string = memberTypes[1].id;

    await new BloomManager().findOneAndUpdate(
      MemberIntegrations,
      { member: member.id },
      { stripeSubscriptionId: mockedStripeSubcriptionId }
    );

    const mockedUpdateStripeSubscription = jest
      .spyOn(updateStripeSubscription, 'default')
      .mockResolvedValue({
        id: mockedStripeSubcriptionId
      } as Stripe.Subscription);

    const updatedMemberIntegrations = await updateStripeSubscriptionId(
      { memberTypeId: newMemberTypeId, prorationDate: null },
      { communityId, memberId }
    );

    expect(mockedUpdateStripeSubscription)
      .toBeCalledTimes(1)
      .toBeCalledWith({
        prorationDate: null,
        stripeAccountId: mockedStripeAccountId,
        stripePriceId: null,
        stripeSubscriptionId: mockedStripeSubcriptionId
      } as updateStripeSubscription.UpdateStripeSubscriptionArgs);

    expect(updatedMemberIntegrations)
      .toHaveProperty('stripeSubscriptionId', mockedStripeSubcriptionId)
      .toHaveProperty('member.memberType.id', newMemberTypeId);
  });
});
