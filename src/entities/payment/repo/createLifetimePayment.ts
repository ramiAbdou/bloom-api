import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Integrations from '@entities/integrations/Integrations';
import MemberIntegrations from '@entities/member-integrations/MemberIntegrations';
import createStripeCustomer from '@entities/member-integrations/repo/createStripeCustomer';
import MemberPlan from '@entities/member-plan/MemberPlan';
import createAndPayStripeInvoice from '@integrations/stripe/repo/createAndPayStripeInvoice';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';
import Payment from '../Payment';
import createDuesPayment from './createDuesPayment';

@ArgsType()
export class CreateLifetimePaymentArgs {
  @Field({ nullable: true })
  memberPlanId: string;
}

const createLifetimePayment = async (
  args: CreateLifetimePaymentArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Payment> => {
  const { memberPlanId } = args;
  const { communityId, memberId } = ctx;

  await createStripeCustomer({ memberId });

  const bm = new BloomManager();

  const [integrations, memberIntegrations, type]: [
    Integrations,
    MemberIntegrations,
    MemberPlan
  ] = await Promise.all([
    bm.findOne(Integrations, { community: { id: communityId } }),
    bm.findOne(MemberIntegrations, { member: memberId }),
    bm.findOne(MemberPlan, { id: memberPlanId })
  ]);

  if (memberIntegrations.stripeSubscriptionId) {
    await stripe.subscriptions.del(memberIntegrations.stripeSubscriptionId, {
      idempotencyKey: nanoid(),
      stripeAccount: integrations.stripeAccountId
    });

    memberIntegrations.stripeSubscriptionId = null;
    await bm.flush({ flushEvent: MutationEvent.DELETE_SUBSCRIPTION });
  }

  const invoice: Stripe.Invoice = await createAndPayStripeInvoice({
    accountId: integrations.stripeAccountId,
    customerId: memberIntegrations.stripeCustomerId,
    priceId: type.stripePriceId
  });

  const payment: Payment = await createDuesPayment(
    { invoice, planId: memberPlanId },
    { communityId, memberId }
  );

  return payment;
};

export default createLifetimePayment;
