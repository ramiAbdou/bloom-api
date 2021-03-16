import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import MemberPlan from '@entities/member-plan/MemberPlan';
import createStripeSubscription, {
  CreateStripeSubscriptionArgs
} from '@integrations/stripe/repo/createStripeSubscription';
import updateStripeSubscription, {
  UpdateStripeSubscriptionArgs
} from '@integrations/stripe/repo/updateStripeSubscription';
import { GQLContext } from '@util/constants';
import { FlushEvent } from '@util/constants.events';
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
    CommunityIntegrations,
    MemberIntegrations,
    MemberPlan
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: communityId }),
    bm.findOne(MemberIntegrations, { member: memberId }),
    bm.findOne(MemberPlan, memberPlanId)
  ]);

  const createSubscriptionArgs: CreateStripeSubscriptionArgs = {
    stripeAccountId: communityIntegrations.stripeAccountId,
    stripeCustomerId: memberIntegrations.stripeCustomerId,
    stripePriceId: type.stripePriceId
  };

  const updateSubscriptionArgs: UpdateStripeSubscriptionArgs = {
    prorationDate,
    stripeAccountId: communityIntegrations.stripeAccountId,
    stripePriceId: type.stripePriceId,
    stripeSubscriptionId: memberIntegrations.stripeSubscriptionId
  };

  const subscription: Stripe.Subscription = memberIntegrations.stripeSubscriptionId
    ? await updateStripeSubscription(updateSubscriptionArgs)
    : await createStripeSubscription(createSubscriptionArgs);

  // If the Stripe subscription succeeds, attach the payment method to the
  // user.
  memberIntegrations.stripeSubscriptionId = subscription.id;

  await bm.flush({ flushEvent: FlushEvent.UPDATE_STRIPE_SUBSCRIPTION_ID });

  return memberIntegrations;
};

export default updateStripeSubscriptionId;
