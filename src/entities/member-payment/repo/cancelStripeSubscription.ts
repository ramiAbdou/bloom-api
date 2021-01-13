import { BloomManagerArgs, GQLContext } from '@constants';
import { stripe } from '@integrations/stripe/Stripe.util';
import CommunityIntegrations from '../../community-integrations/CommunityIntegrations';

interface CancelStripeSubscriptionArgs extends BloomManagerArgs {
  subscriptionId: string;
}

const cancelStripeSubscription = async (
  { bm, subscriptionId }: CancelStripeSubscriptionArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
) => {
  const { stripeAccountId } = await bm.findOne(CommunityIntegrations, {
    community: { id: communityId }
  });

  await stripe.subscriptions.del(subscriptionId, {
    stripeAccount: stripeAccountId
  });
};

export default cancelStripeSubscription;
