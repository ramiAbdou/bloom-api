import { ArgsType, Field } from 'type-graphql';

import updateStripeCustomerId from '@entities/member-integrations/repo/updateStripeCustomerId';
import { GQLContext } from '@util/constants';
import updateStripeSubscriptionId from '../../member-integrations/repo/updateStripeSubscriptionId';
import Member from '../Member';

@ArgsType()
export class UpdatePlanArgs {
  @Field()
  memberPlanId: string;

  @Field(() => Number, { nullable: true })
  prorationDate?: number;
}

/**
 * Returns the Member with the updated plan.
 *
 * @param args.memberPlanId - ID of the MemberPlan.
 * @param args.prorationDate - UTC timestamp of the proration date.
 * @param ctx.communityId - ID of the Community (authenticated).
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const updatePlan = async (
  args: UpdatePlanArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Member> => {
  const { memberPlanId } = args;
  const { communityId, memberId } = ctx;

  await updateStripeCustomerId(ctx);
  await updateStripeSubscriptionId(args, ctx);

  // Cases

  return null;
};

export default updatePlan;
