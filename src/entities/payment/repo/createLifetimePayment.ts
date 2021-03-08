import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Integrations from '@entities/integrations/Integrations';
import MemberIntegrations from '@entities/member-integrations/MemberIntegrations';
import updateStripeCustomerId from '@entities/member-integrations/repo/updateStripeCustomerId';
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

  await updateStripeCustomerId(ctx);

  const bm = new BloomManager();

  const [communityIntegrations, memberIntegrations, type]: [
    Integrations,
    MemberIntegrations,
    MemberPlan
  ] = await Promise.all([
    bm.findOne(Integrations, { community: communityId }),
    bm.findOne(MemberIntegrations, memberId),
    bm.findOne(MemberPlan, memberPlanId)
  ]);

  if (memberIntegrations.stripeSubscriptionId) {
    await stripe.subscriptions.del(memberIntegrations.stripeSubscriptionId, {
      idempotencyKey: nanoid(),
      stripeAccount: communityIntegrations.stripeAccountId
    });

    memberIntegrations.stripeSubscriptionId = null;
    await bm.flush({ flushEvent: MutationEvent.DELETE_SUBSCRIPTION });
  }

  const invoice: Stripe.Invoice = await createAndPayStripeInvoice({
    accountId: communityIntegrations.stripeAccountId,
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
