import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { Member } from '@entities/entities';
import { stripe } from '@integrations/stripe/Stripe.util';
import CommunityIntegrations from '../../community-integrations/CommunityIntegrations';
import MemberType from '../../member-type/MemberType';
import createStripeCustomer from '../../member/repo/createStripeCustomer';
import MemberPayment from '../MemberPayment';
import cancelStripeSubscription from './cancelStripeSubscription';
import createMemberPayment from './createMemberPayment';

@ArgsType()
export class CreateOneTimePaymentArgs {
  @Field()
  memberTypeId: string;
}

/**
 * Precondition: Should only be called for a LIFETIME membership. All other
 * payments should be subscriptions.
 */
const createOneTimePayment = async (
  { memberTypeId }: CreateOneTimePaymentArgs,
  { communityId, memberId }: GQLContext
): Promise<Member> => {
  const bm = new BloomManager();

  const [{ stripeAccountId }, member, type]: [
    CommunityIntegrations,
    Member,
    MemberType
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: { id: communityId } }),
    bm.findOne(Member, { id: memberId }),
    bm.findOne(MemberType, { id: memberTypeId })
  ]);

  const {
    stripeCustomerId,
    stripeSubscriptionId
  }: Member = await createStripeCustomer({ memberId });

  if (stripeSubscriptionId) {
    await cancelStripeSubscription(
      { bm, subscriptionId: stripeSubscriptionId },
      { communityId }
    );
  }

  await stripe.invoiceItems.create(
    { customer: stripeCustomerId, price: type.stripePriceId },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  // Creates the recurring subscription.
  const invoice: Stripe.Invoice = await stripe.invoices.create(
    { auto_advance: false, customer: stripeCustomerId },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  const paidInvoice: Stripe.Invoice = await stripe.invoices.pay(invoice.id, {
    idempotencyKey: nanoid(),
    stripeAccount: stripeAccountId
  });

  const payment: MemberPayment = await createMemberPayment({
    bm,
    communityId,
    invoice: paidInvoice,
    member,
    type
  });

  return payment.member;
};

export default createOneTimePayment;
