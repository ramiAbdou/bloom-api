import Stripe from 'stripe';
import { ArgsType, Field, Int } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import MemberType from '@entities/member-type/MemberType';
import createStripeSubscription, {
  CreateStripeSubscriptionArgs
} from '@integrations/stripe/repo/createStripeSubscription';
import updateStripeSubscription, {
  UpdateStripeSubscriptionArgs
} from '@integrations/stripe/repo/updateStripeSubscription';
import { GQLContext } from '@util/constants';
import MemberIntegrations from '../MemberIntegrations';

@ArgsType()
export class UpdateStripeSubscriptionIdArgs {
  @Field()
  memberTypeId: string;

  @Field(() => Int, { nullable: true })
  prorationDate?: number;
}

/**
 * Returns the updated MemberIntegrations with the Stripe.Subscription ID
 * attached. If the stripeSubscriptionId already exists, then we just want
 * to update the Stripe.Subscription.
 *
 * Precondition: MemberIntegrations associated with memberId must already
 * have a stripeCustomerId.
 *
 * @param args.memberTypeId - ID of the MemberType to switch to.
 * @param args.prorationDate - UTC timestamp of the proration date.
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const updateStripeSubscriptionId = async (
  args: UpdateStripeSubscriptionIdArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberIntegrations> => {
  const { memberTypeId, prorationDate } = args;
  const { communityId, memberId } = ctx;

  const bm: BloomManager = new BloomManager();

  const [communityIntegrations, memberIntegrations, memberType]: [
    CommunityIntegrations,
    MemberIntegrations,
    MemberType
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: communityId }),
    bm.findOne(
      MemberIntegrations,
      { member: memberId },
      { populate: ['member'] }
    ),
    bm.findOne(MemberType, { id: memberTypeId })
  ]);

  const baseSubscriptionArgs: Pick<
    CreateStripeSubscriptionArgs,
    'stripeAccountId' | 'stripePriceId'
  > = {
    stripeAccountId: communityIntegrations.stripeAccountId,
    stripePriceId: memberType.stripePriceId
  };

  const createSubscriptionArgs: CreateStripeSubscriptionArgs = {
    ...baseSubscriptionArgs,
    stripeCustomerId: memberIntegrations.stripeCustomerId
  };

  const updateSubscriptionArgs: UpdateStripeSubscriptionArgs = {
    ...baseSubscriptionArgs,
    prorationDate,
    stripeSubscriptionId: memberIntegrations.stripeSubscriptionId
  };

  const subscription: Stripe.Subscription = memberIntegrations.stripeSubscriptionId
    ? await updateStripeSubscription(updateSubscriptionArgs)
    : await createStripeSubscription(createSubscriptionArgs);

  // Update the stripeSubscriptionId and change the memberType for the Member
  // once it goes through!
  memberIntegrations.stripeSubscriptionId = subscription.id;
  memberIntegrations.member.memberType = memberType;

  await bm.flush();

  return memberIntegrations;
};

export default updateStripeSubscriptionId;
