import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';
import { wrap } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Community from '../../community/Community';
import MemberType from '../../member-type/MemberType';
import Member from '../../member/Member';
import User from '../../user/User';

@ArgsType()
export class CreateSubsciptionArgs {
  @Field()
  memberTypeId: string;

  @Field()
  paymentMethodId: string;
}

type CreateStripeCustomerArgs = { stripeAccountId: string; user: User };

interface CreateStripeSubscriptionArgs extends CreateSubsciptionArgs {
  stripeAccountId: string;
  stripeCustomerId: string;
  stripePriceId: string;
}

/**
 * If the user does not have an associated Stripe customer object, create
 * that object and store it on the user entity.
 *
 * Note: Doesn't flush, just wraps the entity.
 */
const createStripeCustomerIfNeeded = async ({
  stripeAccountId,
  user
}: CreateStripeCustomerArgs): Promise<User> => {
  const { email, fullName, stripeCustomerId } = user;

  // If the stripeCustomerId already exists, there's no need create a new
  // customer.
  if (stripeCustomerId) return user;

  const stripeCustomer = await stripe.customers.create(
    { email, name: fullName },
    { stripeAccount: stripeAccountId }
  );

  wrap(user).assign({ stripeCustomerId: stripeCustomer.id });
  return user;
};

/**
 * Attaches the payment method (card information) to the customer, and sets
 * the invoice to make the default payment method that card. Also creates
 * the Stripe subscription with thei given Stripe price.
 */
const createStripeSubscription = async ({
  paymentMethodId,
  stripeAccountId,
  stripeCustomerId,
  stripePriceId
}: CreateStripeSubscriptionArgs): Promise<void> => {
  const options: Stripe.RequestOptions = { stripeAccount: stripeAccountId };

  await Promise.all([
    // Attaches the PaymentMethod to the customer.
    stripe.paymentMethods.attach(
      paymentMethodId,
      { customer: stripeCustomerId },
      options
    ),

    // Sets the PaymentMethod to be the default method for the customer. Will
    // be used in future subscription payments.
    stripe.customers.update(
      stripeCustomerId,
      { invoice_settings: { default_payment_method: paymentMethodId } },
      options
    ),

    // Creates the subscription with the associated product price for the
    // MemberType.
    stripe.subscriptions.create(
      {
        customer: stripeCustomerId,
        expand: ['latest_invoice.payment_intent'],
        items: [{ price: stripePriceId }]
      },
      options
    )
  ]);
};

export default async (
  { memberTypeId, paymentMethodId }: CreateSubsciptionArgs,
  { communityId, memberId, userId }: GQLContext
) => {
  const bm = new BloomManager();

  const [community, member, type, user]: [
    Community,
    Member,
    MemberType,
    User
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { populate: ['integrations'] }),
    bm.findOne(Member, { id: memberId }, { populate: ['type'] }),
    bm.findOne(MemberType, { id: memberTypeId }),
    bm.findOne(User, { id: userId })
  ]);

  // Update the member's type, if it changed.
  const updatedMember = wrap(member).assign({ type: memberTypeId });

  const { stripeAccountId } = community.integrations;

  // Need to merge the user because we could've potentially updated the Stripe
  // customer ID if it wasn't stored.
  const updatedUser = await createStripeCustomerIfNeeded({
    stripeAccountId,
    user
  });

  // Updates the default payment method for the customer and creates the
  // recurring subscription.
  await createStripeSubscription({
    memberTypeId,
    paymentMethodId,
    stripeAccountId,
    stripeCustomerId: updatedUser.stripeCustomerId,
    stripePriceId: type.stripePriceId
  });

  await bm.flush('STRIPE_INTENT_FLOW_RAN');
  return updatedMember;
};
