import Stripe from 'stripe';
import { Field, ObjectType } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { CreateSubsciptionArgs } from '@entities/member-payment/repo/createSubscription';
import MemberType from '@entities/member-type/MemberType';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import Member from '../Member';

@ObjectType()
export class GetChangePreviewResult {
  @Field(() => Number, { nullable: true })
  amount: number;

  @Field(() => Number, { nullable: true })
  prorationDate: number;
}

/**
 * Returns the payment change amount based on the current proration date.
 */
const getChangePreview = async (
  { memberTypeId }: Pick<CreateSubsciptionArgs, 'memberTypeId'>,
  { communityId, memberId }: GQLContext
): Promise<GetChangePreviewResult> => {
  const bm = new BloomManager();

  const [community, member, type]: [
    Community,
    Member,
    MemberType
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { populate: ['integrations'] }),
    bm.findOne(Member, { id: memberId }),
    bm.findOne(MemberType, { id: memberTypeId })
  ]);

  const { stripeCustomerId, stripeSubscriptionId } = member;
  const { stripePriceId } = type;

  if (!member.stripeSubscriptionId) return null;

  const subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
    { stripeAccount: community.integrations.stripeAccountId }
  );

  const prorationDate = Math.floor(Date.now() / 1000);

  const invoice: Stripe.Invoice = await stripe.invoices.retrieveUpcoming(
    {
      customer: stripeCustomerId,
      subscription: stripeSubscriptionId,
      subscription_items: [
        { id: subscription.items.data[0].id, price: stripePriceId }
      ],
      subscription_proration_behavior: 'always_invoice',
      subscription_proration_date: prorationDate
    },
    { stripeAccount: community.integrations.stripeAccountId }
  );

  const dollarAmount = invoice.amount_due / 100;
  return { amount: dollarAmount > 0 ? dollarAmount : 0, prorationDate };
};

export default getChangePreview;
