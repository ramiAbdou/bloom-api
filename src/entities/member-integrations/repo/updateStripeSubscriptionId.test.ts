/**
 * @group integration
 */

import Stripe from 'stripe';

import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import MemberPlan from '@entities/member-plan/MemberPlan';
import Member from '@entities/member/Member';
import * as createStripeSubscription from '@integrations/stripe/repo/createStripeSubscription';
import * as updateStripeSubscription from '@integrations/stripe/repo/updateStripeSubscription';
import {
  buildCommunityIntegrations,
  buildMember,
  buildMemberPlan,
  initDatabaseIntegrationTest
} from '@util/test.util';
import MemberIntegrations from '../MemberIntegrations';
import updateStripeSubscriptionId from './updateStripeSubscriptionId';

describe('updateStripeSubscriptionId()', () => {
  initDatabaseIntegrationTest();

  test('If the MemberIntegrations does not have a stripeSubscriptionId, it should create a Stripe subscription.', async () => {
    const mockedStripeSubcriptionId = '1';
    const mockedStripeAccountId = '10';

    const communityIntegrations: CommunityIntegrations = await buildCommunityIntegrations(
      { overrides: { stripeAccountId: mockedStripeAccountId } }
    );

    const communityId: string = communityIntegrations.community.id;

    const memberPlans: MemberPlan[] = (await buildMemberPlan({
      count: 3,
      overrides: { community: communityId }
    })) as MemberPlan[];

    const memberPlanId: string = memberPlans[0].id;

    const member: Member = await buildMember({
      overrides: { community: communityId, plan: memberPlanId }
    });

    const memberId: string = member.id;

    const mockedCreateStripeSubscription = jest
      .spyOn(createStripeSubscription, 'default')
      .mockResolvedValue({
        id: mockedStripeSubcriptionId
      } as Stripe.Subscription);

    const updatedMemberIntegrations = await updateStripeSubscriptionId(
      { memberPlanId },
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
      .toHaveProperty('member.plan.id', memberPlanId);
  });

  test('If the MemberIntegrations does have a stripeSubscriptionId, it should update the Stripe subscription (not stripeSubscriptionId) and update the MemberPlan of the Member.', async () => {
    const mockedStripeSubcriptionId = '1';
    const mockedStripeAccountId = '10';

    const communityIntegrations: CommunityIntegrations = await buildCommunityIntegrations(
      { overrides: { stripeAccountId: mockedStripeAccountId } }
    );

    const communityId: string = communityIntegrations.community.id;

    const memberPlans: MemberPlan[] = (await buildMemberPlan({
      count: 3,
      overrides: { community: communityId }
    })) as MemberPlan[];

    const memberPlanId: string = memberPlans[0].id;
    const newMemberPlanId: string = memberPlans[1].id;

    const member: Member = await buildMember({
      overrides: { community: communityId, plan: memberPlanId }
    });

    await new BloomManager().findOneAndUpdate(
      MemberIntegrations,
      { member: member.id },
      { stripeSubscriptionId: mockedStripeSubcriptionId }
    );

    const memberId: string = member.id;

    const mockedUpdateStripeSubscription = jest
      .spyOn(updateStripeSubscription, 'default')
      .mockResolvedValue({
        id: mockedStripeSubcriptionId
      } as Stripe.Subscription);

    const updatedMemberIntegrations = await updateStripeSubscriptionId(
      { memberPlanId: newMemberPlanId, prorationDate: null },
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
      .toHaveProperty('member.plan.id', newMemberPlanId);
  });

  test('Should invalidate the QueryEvent.GET_MEMBERS key within the Member.cache key by triggering the @AfterUpdate lifecycle hook.', async () => {
    const mockedStripeSubcriptionId = '1';
    const mockedStripeAccountId = '10';

    const communityIntegrations: CommunityIntegrations = await buildCommunityIntegrations(
      { overrides: { stripeAccountId: mockedStripeAccountId } }
    );

    const communityId: string = communityIntegrations.community.id;

    const memberPlans: MemberPlan[] = (await buildMemberPlan({
      count: 3,
      overrides: { community: communityId }
    })) as MemberPlan[];

    const memberPlanId: string = memberPlans[0].id;
    const newMemberPlanId: string = memberPlans[1].id;

    const member: Member = await buildMember({
      overrides: { community: communityId, plan: memberPlanId }
    });

    await new BloomManager().findOneAndUpdate(
      MemberIntegrations,
      { member: member.id },
      { stripeSubscriptionId: mockedStripeSubcriptionId }
    );

    const memberId: string = member.id;

    const mockedMemberAfterUpdate = jest.spyOn(Member.prototype, 'afterUpdate');

    jest.spyOn(updateStripeSubscription, 'default').mockResolvedValue({
      id: mockedStripeSubcriptionId
    } as Stripe.Subscription);

    await updateStripeSubscriptionId(
      { memberPlanId: newMemberPlanId, prorationDate: null },
      { communityId, memberId }
    );

    expect(mockedMemberAfterUpdate).toBeCalledTimes(1);
  });
});
