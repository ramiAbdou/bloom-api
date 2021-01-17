import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import CommunityIntegrations from '../../community-integrations/CommunityIntegrations';
import MemberType from '../../member-type/MemberType';
import Member from '../../member/Member';
import createStripeCustomer from '../../member/repo/createStripeCustomer';
import MemberPayment from '../MemberPayment';
import createMemberPayment from './createMemberPayment';

@ArgsType()
export class PayStripeInvoiceArgs {
  @Field({ nullable: true })
  memberTypeId: string;
}

const payStripeInvoice = async (
  { memberTypeId }: PayStripeInvoiceArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
) => {
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

  const { stripePriceId } = type;

  await stripe.invoiceItems.create(
    { customer: stripeCustomerId, price: stripePriceId },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  // Creates the recurring subscription.
  const invoice: Stripe.Invoice = await stripe.invoices.create(
    {
      auto_advance: false,
      customer: stripeCustomerId,
      subscription: stripeSubscriptionId
    },
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

  return payment;
};

export default payStripeInvoice;
