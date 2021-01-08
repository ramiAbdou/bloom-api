import { nanoid } from 'nanoid';
import { ArgsType, Field } from 'type-graphql';
import { wrap } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Community from '../../community/Community';
import Member from '../Member';
import createStripeCustomer from './createStripeCustomer';

@ArgsType()
export class UpdatePaymentMethodArgs {
  @Field()
  paymentMethodId: string;
}

const updatePaymentMethod = async (
  { paymentMethodId }: UpdatePaymentMethodArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
) => {
  const bm = new BloomManager();

  const [community, member]: [Community, Member] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { populate: ['integrations'] }),
    bm.findOne(Member, { id: memberId })
  ]);

  const { stripeAccountId } = community.integrations;
  let { stripeCustomerId } = member;

  // If no Stripe customer ID exists on the member, create and attach the
  // stripeCustomerId to the member.
  if (!stripeCustomerId) {
    const updatedMember: Member = await createStripeCustomer({ memberId });
    stripeCustomerId = updatedMember.stripeCustomerId;
  }

  // Attaches the PaymentMethod to the customer.
  await stripe.paymentMethods.attach(
    paymentMethodId,
    { customer: stripeCustomerId },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  // Sets the PaymentMethod to be the default method for the customer. Will
  // be used in future subscription payments.
  await stripe.customers.update(
    stripeCustomerId,
    { invoice_settings: { default_payment_method: paymentMethodId } },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  wrap(member).assign({ stripePaymentMethodId: paymentMethodId });
  await bm.flush('PAYMENT_METHOD_UPDATED');

  return member;
};

export default updatePaymentMethod;