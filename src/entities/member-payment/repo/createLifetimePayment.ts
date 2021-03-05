import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import MemberPlan from '@entities/member-plan/MemberPlan';
import Member from '@entities/member/Member';
import createStripeCustomer from '@entities/member/repo/createStripeCustomer';
import createAndPayStripeInvoice from '@integrations/stripe/repo/createAndPayStripeInvoice';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import { FlushEvent } from '@util/events';
import MemberPayment from '../MemberPayment';
import createMemberPayment from './createMemberPayment';

@ArgsType()
export class CreateLifetimePaymentArgs {
  @Field({ nullable: true })
  memberPlanId: string;
}

const createLifetimePayment = async (
  { memberPlanId }: CreateLifetimePaymentArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberPayment> => {
  await createStripeCustomer({ memberId });

  const bm = new BloomManager();

  const [integrations, member, type]: [
    CommunityIntegrations,
    Member,
    MemberPlan
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: { id: communityId } }),
    bm.findOne(Member, { id: memberId }),
    bm.findOne(MemberPlan, { id: memberPlanId })
  ]);

  if (member.stripeSubscriptionId) {
    await stripe.subscriptions.del(member.stripeSubscriptionId, {
      idempotencyKey: nanoid(),
      stripeAccount: integrations.stripeAccountId
    });

    member.stripeSubscriptionId = null;
    await bm.flush({ flushEvent: FlushEvent.DELETE_SUBSCRIPTION });
  }

  const invoice: Stripe.Invoice = await createAndPayStripeInvoice({
    accountId: integrations.stripeAccountId,
    customerId: member.stripeCustomerId,
    priceId: type.stripePriceId
  });

  const payment: MemberPayment = await createMemberPayment(
    { invoice, planId: memberPlanId },
    { communityId, memberId }
  );

  return payment;
};

export default createLifetimePayment;
