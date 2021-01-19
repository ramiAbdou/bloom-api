import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Community from '../../community/Community';
import MemberType from '../../member-type/MemberType';
import Member from '../../member/Member';
import createStripeCustomer from '../../member/repo/createStripeCustomer';
import createMemberPayment from './createMemberPayment';

@ArgsType()
export class CreateSubsciptionArgs {
  @Field({ defaultValue: true })
  autoRenew: boolean;

  @Field()
  memberTypeId: string;

  @Field(() => Number, { nullable: true })
  prorationDate?: number;
}

interface CreateStripeSubsciptionArgs {
  prorationDate?: number;
  stripeAccountId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  stripeSubscriptionId?: string;
}

const createStripeSubscription = async ({
  stripeAccountId,
  stripeCustomerId,
  stripePriceId
}: CreateStripeSubsciptionArgs) => {
  const subscription: Stripe.Subscription = await stripe.subscriptions.create(
    {
      customer: stripeCustomerId,
      expand: ['latest_invoice.payment_intent'],
      items: [{ price: stripePriceId }]
    },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  return subscription;
};

const updateStripeSubscription = async ({
  prorationDate,
  stripeAccountId,
  stripePriceId,
  stripeSubscriptionId
}: CreateStripeSubsciptionArgs) => {
  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
    { stripeAccount: stripeAccountId }
  );

  const updatedSubscription = await stripe.subscriptions.update(
    stripeSubscriptionId,
    {
      expand: ['latest_invoice.payment_intent'],
      items: [{ id: subscription.items.data[0].id, price: stripePriceId }],
      proration_behavior: 'always_invoice',
      proration_date: prorationDate
    },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  return updatedSubscription;
};

const createSubscription = async (
  { autoRenew, memberTypeId, prorationDate }: CreateSubsciptionArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Member> => {
  const { communityId, memberId } = ctx;
  const bm = new BloomManager();

  const [community, type]: [Community, MemberType] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { populate: ['integrations'] }),
    bm.findOne(MemberType, { id: memberTypeId })
  ]);

  // Need to merge the user because we could've potentially updated the Stripe
  // customer ID if it wasn't stored.
  const member: Member = await createStripeCustomer({ memberId });
  bm.em.merge(member);

  const { stripeAccountId } = community.integrations;
  const { stripeCustomerId, stripeSubscriptionId } = member;
  const { stripePriceId } = type;

  const args: CreateStripeSubsciptionArgs = {
    prorationDate,
    stripeAccountId,
    stripeCustomerId,
    stripePriceId,
    stripeSubscriptionId
  };

  const subscription: Stripe.Subscription = stripeSubscriptionId
    ? await updateStripeSubscription(args)
    : await createStripeSubscription(args);

  // If the Stripe subscription succeeds, attach the payment method to the
  // user.
  member.autoRenew = autoRenew;
  member.stripeSubscriptionId = subscription.id;

  const invoice = subscription.latest_invoice as Stripe.Invoice;

  const updatedMember: Member = await createMemberPayment({
    bm,
    communityId,
    invoice,
    member,
    type
  });

  return updatedMember;
};

export default createSubscription;
