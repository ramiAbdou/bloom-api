import Stripe from 'stripe';
import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import createStripeSubscription, {
  CreateStripeSubscriptionArgs
} from '@integrations/stripe/repo/createStripeSubscription';
import updateStripeSubscription, {
  UpdateStripeSubscriptionArgs
} from '@integrations/stripe/repo/updateStripeSubscription';
import Community from '../../community/Community';
import MemberType from '../../member-type/MemberType';
import Member from '../../member/Member';
import createStripeCustomer from '../../member/repo/createStripeCustomer';
import MemberPayment from '../MemberPayment';
import createMemberPayment from './createMemberPayment';

@ArgsType()
export class CreateSubsciptionArgs {
  @Field({ defaultValue: true })
  autoRenew: boolean;

  @Field()
  memberTypeId: string;

  @Field(() => Number, { nullable: true })
  prorationDate?: number;
}

const createSubscription = async (
  { autoRenew, memberTypeId, prorationDate }: CreateSubsciptionArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberPayment> => {
  await createStripeCustomer({ memberId });

  const bm = new BloomManager();

  const [community, member, type]: [
    Community,
    Member,
    MemberType
  ] = await Promise.all([
    bm.findOne(Community, { id: communityId }, { populate: ['integrations'] }),
    bm.findOne(Member, { id: memberId }),
    bm.findOne(MemberType, { id: memberTypeId })
  ]);

  const createSubscriptionArgs: CreateStripeSubscriptionArgs = {
    accountId: community.integrations.stripeAccountId,
    customerId: member.stripeCustomerId,
    priceId: type.stripePriceId
  };

  const updateSubscriptionArgs: UpdateStripeSubscriptionArgs = {
    accountId: community.integrations.stripeAccountId,
    priceId: type.stripePriceId,
    prorationDate,
    subscriptionId: member.stripeSubscriptionId
  };

  const subscription: Stripe.Subscription = member.stripeSubscriptionId
    ? await updateStripeSubscription(updateSubscriptionArgs)
    : await createStripeSubscription(createSubscriptionArgs);

  // If the Stripe subscription succeeds, attach the payment method to the
  // user.
  member.autoRenew = autoRenew;
  member.stripeSubscriptionId = subscription.id;

  await bm.flush({ event: 'CREATE_SUBSCRIPTION' });

  const invoice = subscription.latest_invoice as Stripe.Invoice;

  const payment: MemberPayment = await createMemberPayment(
    { invoice, typeId: memberTypeId },
    { communityId, memberId }
  );

  return payment;
};

export default createSubscription;
