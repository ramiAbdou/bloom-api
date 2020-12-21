import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';
import { wrap } from '@mikro-orm/core';

import { BloomManagerArgs, GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Community from '../../community/Community';
import MemberType from '../../member-type/MemberType';
import Member from '../../member/Member';
import { MemberDuesStatus } from '../../member/Member.types';
import User from '../../user/User';
import MemberPayment from '../MemberPayment';

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

interface CreateMemberPaymentArgs extends BloomManagerArgs {
  member: Member;
  type: MemberType;
  subscription: Stripe.Response<Stripe.Subscription>;
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
  const { email, fullName } = user;

  // If the stripeCustomerId already exists, there's no need create a new
  // customer.
  if (user.stripeCustomerId) return user;

  const existingStripeCustomers = (
    await stripe.customers.list(
      { email, limit: 1 },
      { stripeAccount: stripeAccountId }
    )
  )?.data;

  // If for whatever reason there is a customer that already exists with the
  // user's email, just update the User with that Stripe customer ID, no need
  // to create another one.
  const stripeCustomerId: string = existingStripeCustomers.length
    ? existingStripeCustomers[0].id
    : (
        await stripe.customers.create(
          { email, name: fullName },
          { stripeAccount: stripeAccountId }
        )
      ).id;

  wrap(user).assign({ stripeCustomerId });
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
}: CreateStripeSubscriptionArgs): Promise<
  Stripe.Response<Stripe.Subscription>
> => {
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

  // Creates the subscription with the associated product price for the
  // MemberType. Must execute this after so user has default payment method.
  const subscription = await stripe.subscriptions.create(
    {
      customer: stripeCustomerId,
      expand: ['latest_invoice.payment_intent'],
      items: [{ price: stripePriceId }]
    },
    { idempotencyKey: nanoid(), stripeAccount: stripeAccountId }
  );

  return subscription;
};

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
      type
    });

    wrap(member).assign({ duesStatus: MemberDuesStatus.ACTIVE });
  }
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
  const subscription = await createStripeSubscription({
    memberTypeId,
    paymentMethodId,
    stripeAccountId,
    stripeCustomerId: updatedUser.stripeCustomerId,
    stripePriceId: type.stripePriceId
  });

  createMemberPaymentFromSubscription({
    bm,
    member: updatedMember,
    subscription,
    type
  });

  await bm.flush('STRIPE_SUBSCRIPTION_CREATED');
  return updatedMember;
};
