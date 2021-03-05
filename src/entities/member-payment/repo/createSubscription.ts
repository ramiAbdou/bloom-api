import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import MemberPlan from '@entities/member-plan/MemberPlan';
import Member from '@entities/member/Member';
import createStripeCustomer from '@entities/member/repo/createStripeCustomer';
import createStripeSubscription, {
  CreateStripeSubscriptionArgs
} from '@integrations/stripe/repo/createStripeSubscription';
import updateStripeSubscription, {
  UpdateStripeSubscriptionArgs
} from '@integrations/stripe/repo/updateStripeSubscription';
import { GQLContext } from '@util/constants';
import { FlushEvent } from '@util/events';
import MemberPayment from '../MemberPayment';
import createMemberPayment from './createMemberPayment';

@ArgsType()
export class CreateSubsciptionArgs {
  @Field()
  memberPlanId: string;

  @Field(() => Number, { nullable: true })
  prorationDate?: number;
}

const createSubscription = async (
  args: CreateSubsciptionArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberPayment> => {
  const { memberPlanId, prorationDate } = args;
  const { communityId, memberId } = ctx;

  await createStripeCustomer({ memberId });

  const bm = new BloomManager();

  const [community, member, type]: [
    Community,
    Member,
    MemberPlan
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { populate: ['integrations'] }),
    bm.findOne(Member, { id: memberId }),
    bm.findOne(MemberPlan, { id: memberPlanId })
  ]);

  const createSubscriptionArgs: CreateStripeSubscriptionArgs = {
    accountId: community.integrations.stripeAccountId,
    customerId: member.stripeCustomerId,
    priceId: type.stripePriceId
  };

  const updateSubscriptionArgs: UpdateStripeSubscriptionArgs = {
    accountId: community.integrations.stripeAccountId,
    priceId: type.stripePriceId,
    prorationDate,
    subscriptionId: member.stripeSubscriptionId
  };

  const subscription: Stripe.Subscription = member.stripeSubscriptionId
    ? await updateStripeSubscription(updateSubscriptionArgs)
    : await createStripeSubscription(createSubscriptionArgs);

  // If the Stripe subscription succeeds, attach the payment method to the
  // user.
  member.stripeSubscriptionId = subscription.id;

  await bm.flush({ flushEvent: FlushEvent.CREATE_SUBSCRIPTION });

  const invoice = subscription.latest_invoice as Stripe.Invoice;

  const payment: MemberPayment = await createMemberPayment(
    { invoice, planId: memberPlanId },
    ctx
  );

  return payment;
};

export default createSubscription;
