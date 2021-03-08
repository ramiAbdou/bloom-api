import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import updateStripeCustomerId from '@entities/member-integrations/repo/updateStripeCustomerId';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import updateStripeSubscriptionId from '../../member-integrations/repo/updateStripeSubscriptionId';
import Payment from '../Payment';
import createDuesPayment from './createDuesPayment';

@ArgsType()
export class CreateSubsciptionArgs {
  @Field()
  memberPlanId: string;

  @Field(() => Number, { nullable: true })
  prorationDate?: number;
}

/**
 * Returns the new Payment.
 *
 * @param args.memberPlanId - ID of the MemberPlan.
 * @param args.prorationDate - UTC timestamp of the proration date.
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const createSubscription = async (
  args: CreateSubsciptionArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Payment> => {
  const { memberPlanId } = args;

  await updateStripeCustomerId(ctx);
  const memberIntegrations = await updateStripeSubscriptionId(args, ctx);

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
    memberIntegrations.stripeSubscriptionId,
    { expand: ['latest_invoice.payment_intent'] }
  );

  const invoice = subscription.latest_invoice as Stripe.Invoice;

  const payment: Payment = await createDuesPayment(
    { invoice, planId: memberPlanId },
    ctx
  );

  return payment;
};

export default createSubscription;
