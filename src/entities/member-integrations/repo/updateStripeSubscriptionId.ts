import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Integrations from '@entities/integrations/Integrations';
import MemberPlan from '@entities/member-plan/MemberPlan';
import createStripeSubscription, {
  CreateStripeSubscriptionArgs
} from '@integrations/stripe/repo/createStripeSubscription';
import updateStripeSubscription, {
  UpdateStripeSubscriptionArgs
} from '@integrations/stripe/repo/updateStripeSubscription';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';
import MemberIntegrations from '../MemberIntegrations';

@ArgsType()
export class UpdateStripeSubscriptionIdArgs {
  @Field()
  memberPlanId: string;

  @Field(() => Number, { nullable: true })
  prorationDate?: number;
}

/**
 * Returns the updated MemberIntegrations with the Stripe.Subscription ID
 * attached.
 *
 * @param args.memberPlanId - ID of the MemberPlan to switch to.
 * @param args.prorationDate - UTC timestamp of the proration date.
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const updateStripeSubscriptionId = async (
  args: UpdateStripeSubscriptionIdArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberIntegrations> => {
  const { memberPlanId, prorationDate } = args;
  const { communityId, memberId } = ctx;

  const bm = new BloomManager();

  const [communityIntegrations, memberIntegrations, type]: [
    Integrations,
    MemberIntegrations,
    MemberPlan
  ] = await Promise.all([
    bm.findOne(Integrations, { community: communityId }),
    bm.findOne(MemberIntegrations, { member: memberId }),
    bm.findOne(MemberPlan, memberPlanId)
  ]);

  const createSubscriptionArgs: CreateStripeSubscriptionArgs = {
    stripeAccountId: communityIntegrations.stripeAccountId,
    stripeCustomerId: memberIntegrations.stripeCustomerId,
    stripePriceId: type.stripePriceId
  };

  const updateSubscriptionArgs: UpdateStripeSubscriptionArgs = {
    accountId: communityIntegrations.stripeAccountId,
    priceId: type.stripePriceId,
    prorationDate,
    subscriptionId: memberIntegrations.stripeSubscriptionId
  };

  const subscription: Stripe.Subscription = memberIntegrations.stripeSubscriptionId
    ? await updateStripeSubscription(updateSubscriptionArgs)
    : await createStripeSubscription(createSubscriptionArgs);

  // If the Stripe subscription succeeds, attach the payment method to the
  // user.
  memberIntegrations.stripeSubscriptionId = subscription.id;

  await bm.flush({ flushEvent: MutationEvent.UPDATE_STRIPE_SUBSCRIPTION_ID });

  return memberIntegrations;
};

export default updateStripeSubscriptionId;
