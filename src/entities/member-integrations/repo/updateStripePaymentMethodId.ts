import { nanoid } from 'nanoid';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Integrations from '@entities/integrations/Integrations';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';
import MemberIntegrations from '../MemberIntegrations';
import updateStripeCustomerId from './updateStripeCustomerId';

@ArgsType()
export class UpdateStripePaymentMethodIdArgs {
  @Field()
  paymentMethodId: string;
}

/**
 * Returns the updated MemberIntegrations with Stripe paymentMethodId
 * attached.
 *
 * @param args.paymentMethodId - ID of the Stripe PaymentMethod.
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const updateStripePaymentMethodId = async (
  args: UpdateStripePaymentMethodIdArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberIntegrations> => {
  const { paymentMethodId } = args;
  const { communityId, memberId } = ctx;

  const bm = new BloomManager();

  const [communityIntegrations, memberIntegrations]: [
    Integrations,
    MemberIntegrations
  ] = await Promise.all([
    bm.findOne(Integrations, { community: communityId }),
    bm.findOne(MemberIntegrations, { member: memberId })
  ]);

  // If no Stripe customer ID exists on the member, create and attach the
  // stripeCustomerId to the member.
  const stripeCustomerId: string =
    memberIntegrations.stripeCustomerId ??
    (await updateStripeCustomerId(ctx))?.stripeCustomerId;

  // Attaches the PaymentMethod to the customer.
  await stripe.paymentMethods.attach(
    paymentMethodId,
    { customer: stripeCustomerId },
    {
      idempotencyKey: nanoid(),
      stripeAccount: communityIntegrations.stripeAccountId
    }
  );

  // Sets the PaymentMethod to be the default method for the customer. Will
  // be used in future subscription payments.
  await stripe.customers.update(
    stripeCustomerId,
    { invoice_settings: { default_payment_method: paymentMethodId } },
    {
      idempotencyKey: nanoid(),
      stripeAccount: communityIntegrations.stripeAccountId
    }
  );

  memberIntegrations.stripePaymentMethodId = paymentMethodId;
  await bm.flush({ flushEvent: MutationEvent.UPDATE_STRIPE_PAYMENT_METHOD_ID });

  return memberIntegrations;
};

export default updateStripePaymentMethodId;
