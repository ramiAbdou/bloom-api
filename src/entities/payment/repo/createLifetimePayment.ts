import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Integrations from '@entities/integrations/Integrations';
import MemberPlan from '@entities/member-plan/MemberPlan';
import Member from '@entities/member/Member';
import createStripeCustomer from '@entities/member/repo/createStripeCustomer';
import createAndPayStripeInvoice from '@integrations/stripe/repo/createAndPayStripeInvoice';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import { FlushEvent } from '@util/events';
import Payment from '../Payment';
import createDuesPayment from './createDuesPayment';

@ArgsType()
export class CreateLifetimePaymentArgs {
  @Field({ nullable: true })
  memberPlanId: string;
}

const createLifetimePayment = async (
  { memberPlanId }: CreateLifetimePaymentArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Payment> => {
  await createStripeCustomer({ memberId });

  const bm = new BloomManager();

  const [integrations, member, type]: [
    Integrations,
    Member,
    MemberPlan
  ] = await Promise.all([
    bm.findOne(Integrations, { community: { id: communityId } }),
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

  const payment: Payment = await createDuesPayment(
    { invoice, planId: memberPlanId },
    { communityId, memberId }
  );

  return payment;
};

export default createLifetimePayment;
