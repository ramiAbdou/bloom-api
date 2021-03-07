import { nanoid } from 'nanoid';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';
import MemberIntegrations from '../MemberIntegrations';
import createStripeCustomer from './createStripeCustomer';

@ArgsType()
export class UpdatePaymentMethodArgs {
  @Field()
  paymentMethodId: string;
}

const updatePaymentMethod = async (
  args: UpdatePaymentMethodArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberIntegrations> => {
  const { paymentMethodId } = args;
  const { communityId, memberId } = ctx;

  const bm = new BloomManager();

  const [community, integrations]: [
    Community,
    MemberIntegrations
  ] = await Promise.all([
    bm.findOne(Community, communityId, { populate: ['integrations'] }),
    bm.findOne(MemberIntegrations, { member: memberId })
  ]);

  // If no Stripe customer ID exists on the member, create and attach the
  // stripeCustomerId to the member.
  const stripeCustomerId: string =
    integrations.stripeCustomerId ??
    (await createStripeCustomer({ memberId }))?.stripeCustomerId;

  // Attaches the PaymentMethod to the customer.
  await stripe.paymentMethods.attach(
    paymentMethodId,
    { customer: stripeCustomerId },
    {
      idempotencyKey: nanoid(),
      stripeAccount: community.integrations.stripeAccountId
    }
  );

  // Sets the PaymentMethod to be the default method for the customer. Will
  // be used in future subscription payments.
  await stripe.customers.update(
    stripeCustomerId,
    { invoice_settings: { default_payment_method: paymentMethodId } },
    {
      idempotencyKey: nanoid(),
      stripeAccount: community.integrations.stripeAccountId
    }
  );

  integrations.stripePaymentMethodId = paymentMethodId;
  await bm.flush({ flushEvent: MutationEvent.UPDATE_PAYMENT_METHOD });

  return integrations;
};

export default updatePaymentMethod;
