import Stripe from 'stripe';
import { Field, ObjectType } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import MemberPlan from '@entities/member-plan/MemberPlan';
import { CreateSubsciptionArgs } from '@entities/payment/repo/createSubscription';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import MemberIntegrations from '../MemberIntegrations';

@ObjectType()
export class GetChangePreviewResult {
  @Field(() => Number, { nullable: true })
  amount: number;

  @Field(() => Number, { nullable: true })
  prorationDate: number;
}

/**
 * Returns a preview of the amount Stripe would charge if the Member were
 * to switch their MemberPlan.
 *
 * @param args.memberPlanId - ID of the MemberPlan.
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const getChangePreview = async (
  args: Pick<CreateSubsciptionArgs, 'memberPlanId'>,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<GetChangePreviewResult> => {
  const { memberPlanId } = args;
  const { communityId, memberId } = ctx;

  const bm: BloomManager = new BloomManager();

  const [community, memberIntegrations, plan]: [
    Community,
    MemberIntegrations,
    MemberPlan
  ] = await Promise.all([
    bm.findOne(Community, communityId, { populate: ['communityIntegrations'] }),
    bm.findOne(MemberIntegrations, { member: memberId }),
    bm.findOne(MemberPlan, memberPlanId)
  ]);

  const { stripeCustomerId, stripeSubscriptionId } = memberIntegrations;

  if (!memberIntegrations.stripeSubscriptionId) return null;

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
    { stripeAccount: community.communityIntegrations.stripeAccountId }
  );

  const prorationDate: number = Math.floor(Date.now() / 1000);

  const invoice: Stripe.Invoice = await stripe.invoices.retrieveUpcoming(
    {
      customer: stripeCustomerId,
      subscription: stripeSubscriptionId,
      subscription_items: [
        { id: subscription.items.data[0].id, price: plan.stripePriceId }
      ],
      subscription_proration_behavior: 'always_invoice',
      subscription_proration_date: prorationDate
    },
    { stripeAccount: community.communityIntegrations.stripeAccountId }
  );

  const dollarAmount = invoice.amount_due / 100;
  return { amount: dollarAmount > 0 ? dollarAmount : 0, prorationDate };
};

export default getChangePreview;
