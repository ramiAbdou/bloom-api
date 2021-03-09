import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Integrations from '@entities/integrations/Integrations';
import MemberIntegrations from '@entities/member-integrations/MemberIntegrations';
import updateStripeCustomerId from '@entities/member-integrations/repo/updateStripeCustomerId';
import MemberPlan from '@entities/member-plan/MemberPlan';
import createAndPayStripeInvoice from '@integrations/stripe/repo/createAndPayStripeInvoice';
import { GQLContext } from '@util/constants';
import removeStripeSubscriptionId from '../../member-integrations/repo/removeStripeSubscriptionId';
import Payment from '../Payment';
import createPayment from './createPayment';

@ArgsType()
export class CreateLifetimePaymentArgs {
  @Field({ nullable: true })
  memberPlanId: string;
}

/**
 * Returns the new Payment.
 *
 * @param args.memberPlanId - ID of the MemberPlan
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const createLifetimePayment = async (
  args: CreateLifetimePaymentArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Payment> => {
  const { memberPlanId } = args;
  const { communityId, memberId } = ctx;

  await updateStripeCustomerId(ctx);
  await removeStripeSubscriptionId(ctx);

  const bm = new BloomManager();

  const [communityIntegrations, memberIntegrations, plan]: [
    Integrations,
    MemberIntegrations,
    MemberPlan
  ] = await Promise.all([
    bm.findOne(Integrations, { community: communityId }),
    bm.findOne(MemberIntegrations, { member: memberId }),
    bm.findOne(MemberPlan, memberPlanId)
  ]);

  const invoice: Stripe.Invoice = await createAndPayStripeInvoice({
    accountId: communityIntegrations.stripeAccountId,
    customerId: memberIntegrations.stripeCustomerId,
    priceId: plan.stripePriceId
  });

  const payment: Payment = await createPayment(
    { invoice, planId: memberPlanId },
    { communityId, memberId }
  );

  return payment;
};

export default createLifetimePayment;
