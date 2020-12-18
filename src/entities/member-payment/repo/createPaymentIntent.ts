import { nanoid } from 'nanoid';
import { ArgsType, Field } from 'type-graphql';
import { wrap } from '@mikro-orm/core';

import { BloomManagerArgs, GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { stripe } from '@integrations/stripe/Stripe.util';
import Community from '../../community/Community';
import MemberType from '../../member-type/MemberType';
import Member from '../../member/Member';
import User from '../../user/User';
import MemberPayment from '../MemberPayment';
import { MemberPaymentStatus } from '../MemberPayment.types';

@ArgsType()
export class CreatePaymentIntentArgs {
  @Field()
  memberTypeId: string;
}

interface CreateStripeCustomerArgs {
  community: Community;
  user: User;
}

interface GetExistingClientSecretArgs extends BloomManagerArgs {
  member: Member;
  stripeAccountId: string;
  type: MemberType;
}

interface CreatePaymentRecordArgs extends BloomManagerArgs {
  name: string;
  member: Member;
  stripeAccountId: string;
  type: MemberType;
  user: User;
}

/**
 * If the user does not have an associated Stripe customer object, create
 * that object and store it on the user entity.
 */
const createStripeCustomerIfNeeded = async ({
  community,
  user
}: CreateStripeCustomerArgs): Promise<User> => {
  const { email, fullName, stripeCustomerId } = user;

  // If the stripeCustomerId already exists, there's no need create a new
  // customer.
  if (stripeCustomerId) return user;

  const stripeCustomer = await stripe.customers.create(
    { email, name: fullName },
    { stripeAccount: community.integrations.stripeAccountId }
  );

  wrap(user).assign({ stripeCustomerId: stripeCustomer.id });
  return user;
};

/**
 * Returns an existing Stripe client secret from a PaymentIntent object
 * that was already created. Updates Stripe record if necessary.
 */
const getExistingClientSecret = async ({
  bm,
  member,
  stripeAccountId,
  type
}: GetExistingClientSecretArgs): Promise<string> => {
  const fetchedPayment: MemberPayment = await bm.findOne(MemberPayment, {
    member,
    status: MemberPaymentStatus.PENDING
  });

  // If no MemberPayment record exists, there is no existing PaymentIntent
  // object, so exit.
  if (!fetchedPayment) return null;

  const amount = type.amount * 100;
  wrap(fetchedPayment).assign({ amount, type });

  // Have to update Stripe's records of the amount as well.
  const existingIntent = await stripe.paymentIntents.update(
    fetchedPayment.stripePaymentIntentId,
    { amount },
    { stripeAccount: stripeAccountId }
  );

  return existingIntent.client_secret;
};

/**
 * Returns a Stripe client secret for a payment. This calls Stripe SDK to
 * create a PaymentIntent object, and we store the ID of the intent in
 * the MemberPayment entity, including an unique idempotencyKey.
 *
 * Precondition: Community must already have connected their Stripe account.
 */
const createClientSecret = async ({
  bm,
  member,
  name,
  stripeAccountId,
  type,
  user
}: CreatePaymentRecordArgs): Promise<string> => {
  const payment: MemberPayment = bm.create(MemberPayment, {
    amount: type.amount * 100,
    idempotencyKey: nanoid(),
    member,
    type
  });

  try {
    const { amount, idempotencyKey } = payment;
    const { id: memberId } = member;

    const intent = await stripe.paymentIntents.create(
      {
        amount,
        currency: 'usd',
        customer: user.stripeCustomerId,
        description: `${name} Dues`,
        metadata: { idempotencyKey, memberId },
        receipt_email: 'rami@bl.community',
        setup_future_usage: 'off_session',
        statement_descriptor: `${name} Dues`
      },
      { idempotencyKey, stripeAccount: stripeAccountId }
    );

    wrap(payment).assign({ stripePaymentIntentId: intent.id });
    return intent.client_secret;
  } catch (e) {
    throw new Error('Failed to charge card.');
  }
};

/**
 * Returns the Stripe client secret needed to confirm a payment.
 *
 * A few use cases are possible when attempting to createPaymentIntent:
 * - Member could have a paymentIntent that was already created is still
 * PENDING. If so, we use that.
 * - Member could update the type of their membership type, which
 * simultaneously changes the amount of the payment intent.
 */
export default async (
  { memberTypeId }: CreatePaymentIntentArgs,
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

  // Need to merge the user because we could've potentially updated the Stripe
  // customer ID if it wasn't stored.
  const updatedUser = await createStripeCustomerIfNeeded({ community, user });

  const { name, integrations } = community;
  const { stripeAccountId } = integrations;

  const baseArgs: GetExistingClientSecretArgs = {
    bm,
    member,
    stripeAccountId,
    type
  };

  const clientSecret: string =
    (await getExistingClientSecret(baseArgs)) ??
    (await createClientSecret({ ...baseArgs, name, user: updatedUser }));

  await bm.flush('STRIPE_INTENT_FLOW_RAN');
  return clientSecret;
};
