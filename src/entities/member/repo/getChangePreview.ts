import Stripe from 'stripe';
import { Field, ObjectType } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Community from '../../community/Community';
import MemberType from '../../member-type/MemberType';
import Member from '../../member/Member';
import { CreateSubsciptionArgs } from './createSubscription';

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
    community.integrations.stripeOptions
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
    community.integrations.stripeOptions
  );

  const dollarAmount = invoice.amount_due / 100;
  return { amount: dollarAmount > 0 ? dollarAmount : 0, prorationDate };
};

export default getChangePreview;
