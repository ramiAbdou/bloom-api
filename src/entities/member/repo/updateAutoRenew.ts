// import { nanoid } from 'nanoid';
import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
// import { stripe } from '@integrations/stripe/Stripe.util';
import Member from '../Member';

@ArgsType()
export class UpdateAutoRenewArgs {
  @Field(() => Boolean)
  status: boolean;
}

const updateAutoRenew = async (
  { status }: UpdateAutoRenewArgs,
  { memberId }: GQLContext
) => {
  const member: Member = await new BloomManager().findOneAndUpdate(
    Member,
    { id: memberId },
    { autoRenew: status },
    { event: 'AUTO_RENEW_UPDATED', populate: ['community.integrations'] }
  );

  // const { stripeSubscriptionId } = member;

  // if (stripeSubscriptionId) {
  //   await stripe.subscriptions.update(
  //     stripeSubscriptionId,
  //     { collection_method: status ? 'charge_automatically' : 'send_invoice' },
  //     {
  //       idempotencyKey: nanoid(),
  //       stripeAccount: member.community.integrations.stripeAccountId
  //     }
  //   );
  // }

  return member;
};

export default updateAutoRenew;
