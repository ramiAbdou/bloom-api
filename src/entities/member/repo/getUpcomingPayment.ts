import day from 'dayjs';
import Stripe from 'stripe';
import { Field, ObjectType } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Integrations from '@entities/integrations/Integrations';
import { stripe } from '@integrations/stripe/Stripe.util';
import { GQLContext } from '@util/constants';
import Member from '../Member';

@ObjectType()
export class GetUpcomingPaymentResult {
  @Field(() => Number)
  amount: number;

  @Field()
  nextPaymentDate: string;
}

/**
 * Returns the upcoming payment details of a Member.
 *
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const getUpcomingPayment = async (
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<GetUpcomingPaymentResult> => {
  const { communityId, memberId } = ctx;

  const bm = new BloomManager();

  const [integrations, member]: [Integrations, Member] = await Promise.all([
    bm.findOne(Integrations, { community: communityId }),
    bm.findOne(Member, memberId)
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
