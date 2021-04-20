import Stripe from 'stripe';
import { ArgsType, Field, ObjectType } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import MemberType from '@entities/member-type/MemberType';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import MemberIntegrations from '../MemberIntegrations';

@ArgsType()
export class GetChangePreviewArgs {
  @Field()
  memberTypeId: string;

  @Field(() => Number, { nullable: true })
  prorationDate?: number;
}

@ObjectType()
export class GetChangePreviewResult {
  @Field(() => Number, { nullable: true })
  amount: number;

  @Field(() => Number, { nullable: true })
  prorationDate: number;
}

/**
 * Returns a preview of the amount Stripe would charge if the Member were
 * to switch their MemberType.
 *
 * @param args.memberTypeId - ID of the MemberType.
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const getChangePreview = async (
  args: Pick<GetChangePreviewArgs, 'memberTypeId'>,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<GetChangePreviewResult> => {
  const { memberTypeId } = args;
  const { communityId, memberId } = ctx;

  const bm: BloomManager = new BloomManager();

  const [communityIntegrations, memberIntegrations, memberType]: [
    CommunityIntegrations,
    MemberIntegrations,
    MemberType
  ] = await Promise.all([
    bm.em.findOne(CommunityIntegrations, { community: communityId }),
    bm.em.findOne(MemberIntegrations, { member: memberId }),
    bm.em.findOne(MemberType, { id: memberTypeId })
  ]);

  const { stripeCustomerId, stripeSubscriptionId } = memberIntegrations;

  if (!memberIntegrations.stripeSubscriptionId) return null;

  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
    { stripeAccount: communityIntegrations.stripeAccountId }
  );

  const prorationDate: number = Math.floor(Date.now() / 1000);

  const subscriptionItems = [
    // Switch to new price to see what the next invoice would look like.
    { id: subscription.items.data[0].id, price: memberType.stripePriceId }
  ] as Stripe.InvoiceRetrieveUpcomingParams.SubscriptionItem[];

  const invoice: Stripe.Invoice = await stripe.invoices.retrieveUpcoming(
    {
      customer: stripeCustomerId,
      subscription: stripeSubscriptionId,
      subscription_items: subscriptionItems,
      subscription_proration_behavior: 'always_invoice',
      subscription_proration_date: prorationDate
    },
    { stripeAccount: communityIntegrations.stripeAccountId }
  );

  const dollarAmount = invoice.amount_due / 100;
  return { amount: dollarAmount > 0 ? dollarAmount : 0, prorationDate };
};

export default getChangePreview;
