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
export class CreateLifetimePaymentArgs {
  @Field({ nullable: true })
  memberTypeId: string;
}

const createLifetimePayment = async (
  { memberTypeId }: CreateLifetimePaymentArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberPayment> => {
  const bm = new BloomManager();

  const [{ stripeAccountId }, type]: [
    CommunityIntegrations,
    MemberType
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: { id: communityId } }),
    bm.findOne(MemberType, { id: memberTypeId })
  ]);

  const member: Member = await createStripeCustomer({ memberId });
  bm.em.merge(member);

  const { stripeCustomerId, stripeSubscriptionId } = member;
  const { stripePriceId } = type;

  if (stripeSubscriptionId) {
    await stripe.subscriptions.del(stripeSubscriptionId, {
      idempotencyKey: nanoid(),
      stripeAccount: stripeAccountId
    });
  }

  await stripe.invoiceItems.create(
    { customer: stripeCustomerId, price: stripePriceId },
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

  const payment: MemberPayment = await createMemberPayment(
    { invoice: paidInvoice, typeId: type.id },
    { communityId, memberId }
  );

  return payment;
};

export default createLifetimePayment;
