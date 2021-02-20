import day from 'dayjs';
import Stripe from 'stripe';
import { Field, ObjectType } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import { stripe } from '@integrations/stripe/Stripe.util';
import Member from '../Member';

@ObjectType()
export class GetUpcomingPaymentResult {
  @Field(() => Number)
  amount: number;

  @Field()
  nextPaymentDate: string;
}

const getUpcomingPayment = async ({
  communityId,
  memberId
}: GQLContext): Promise<GetUpcomingPaymentResult> => {
  const bm = new BloomManager();

  const [integrations, member]: [
    CommunityIntegrations,
    Member
  ] = await Promise.all([
    bm.findOne(CommunityIntegrations, { community: { id: communityId } }),
    bm.findOne(Member, { id: memberId })
  ]);

  const invoice: Stripe.Invoice = await stripe.invoices.retrieveUpcoming(
    { customer: member.stripeCustomerId },
    { stripeAccount: integrations.stripeAccountId }
  );

  if (!invoice) return null;

  return {
    amount: invoice.amount_due / 100,
    nextPaymentDate: day.utc(invoice.next_payment_attempt * 1000).format()
  };
};

export default getUpcomingPayment;
