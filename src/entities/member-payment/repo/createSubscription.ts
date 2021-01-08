import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';
import { wrap } from '@mikro-orm/core';

import { BloomManagerArgs, GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Community from '../../community/Community';
import MemberType from '../../member-type/MemberType';
import Member from '../../member/Member';
import { MemberDuesStatus } from '../../member/Member.types';
import createStripeCustomer from '../../member/repo/createStripeCustomer';
import MemberPayment from '../MemberPayment';

@ArgsType()
export class CreateSubsciptionArgs {
  @Field()
  memberTypeId: string;
}

interface CreateMemberPaymentArgs extends BloomManagerArgs {
  member: Member;
  type: MemberType;
  subscription: Stripe.Response<Stripe.Subscription>;
}

/**
 * Creates MemberPayment record if the subscription was successful and is now
 * active. All other invoices should be handled via webhooks, except for this
 * initial time, since we want to update our UI immediately.
 */
const createMemberPaymentFromSubscription = ({
  bm,
  member,
  subscription,
  type
}: CreateMemberPaymentArgs) => {
  const { latest_invoice, status } = subscription;
  const lastestInvoice = latest_invoice as Stripe.Invoice;

  // Only if the subscription worked should the MemberPayment be created.
  if (status === 'active' && lastestInvoice.status === 'paid') {
    bm.create(MemberPayment, {
      amount: lastestInvoice.amount_paid,
      member,
      stripeInvoiceId: lastestInvoice.id,
      stripeInvoiceUrl: lastestInvoice.hosted_invoice_url,
      type
    });

    wrap(member).assign({ duesStatus: MemberDuesStatus.ACTIVE });
  }
};

const createSubscription = async (
  { memberTypeId }: CreateSubsciptionArgs,
  { communityId, memberId }: GQLContext
) => {
  const bm = new BloomManager();

  const [community, type]: [Community, MemberType] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { populate: ['integrations'] }),
    bm.findOne(MemberType, { id: memberTypeId })
  ]);

  const { stripeAccountId } = community.integrations;

  // Need to merge the user because we could've potentially updated the Stripe
  // customer ID if it wasn't stored.
  const member = await createStripeCustomer({ memberId });

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
  const updatedMember = wrap(member).assign({ type });

  createMemberPaymentFromSubscription({
    bm,
    member: updatedMember,
    subscription,
    type
  });

  await bm.flush('STRIPE_SUBSCRIPTION_CREATED');

  cache.invalidateEntries([
    `${QueryEvent.GET_PAYMENT_HISTORY}-${communityId}`,
    `${QueryEvent.GET_PAYMENTS}-${memberId}`
  ]);

  return updatedMember;
};

export default createSubscription;
