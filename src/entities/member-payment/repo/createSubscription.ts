import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Community from '../../community/Community';
import MemberType from '../../member-type/MemberType';
import Member from '../../member/Member';
import createStripeCustomer from '../../member/repo/createStripeCustomer';
import MemberPayment from '../MemberPayment';
import createMemberPayment from './createMemberPayment';

@ArgsType()
export class CreateSubsciptionArgs {
  @Field({ defaultValue: true })
  autoRenew: boolean;

  @Field()
  memberTypeId: string;
}

const createSubscription = async (
  { autoRenew, memberTypeId }: CreateSubsciptionArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Member> => {
  const bm = new BloomManager();

  const [community, type]: [Community, MemberType] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { populate: ['integrations'] }),
    bm.findOne(MemberType, { id: memberTypeId })
  ]);

  const { stripeAccountId } = community.integrations;

  // Need to merge the user because we could've potentially updated the Stripe
  // customer ID if it wasn't stored.
  const member: Member = await createStripeCustomer({ memberId });

  // Creates the recurring subscription.
  const subscription = await stripe.subscriptions.create(
    {
      customer: member.stripeCustomerId,
      expand: ['latest_invoice.payment_intent'],
      items: [{ price: type.stripePriceId }]
    },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  // If the Stripe subscription succeeds, attach the payment method to the
  // user.
  member.autoRenew = autoRenew;
  member.stripeSubscriptionId = subscription.id;

  const payment: MemberPayment = await createMemberPayment({
    bm,
    communityId,
    invoice: subscription.latest_invoice as Stripe.Invoice,
    member,
    type
  });

  cache.invalidateEntries([
    `${QueryEvent.GET_PAYMENT_HISTORY}-${member.id}`,
    `${QueryEvent.GET_PAYMENTS}-${communityId}`,
    `${QueryEvent.GET_TOTAL_DUES_COLLECTED}-${communityId}`
  ]);

  return payment.member;
};

export default createSubscription;
