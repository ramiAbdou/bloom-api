import { ArgsType, Field } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext } from '@util/constants';
import BloomManager from '@core/db/BloomManager';
import { QueryEvent } from '@util/events';
import MemberPayment from '../MemberPayment';

@ArgsType()
export class GetMemberPaymentsArgs {
  @Field({ nullable: true })
  memberId?: string;
}

const getMemberPayments = async (
  args: GetMemberPaymentsArgs,
  ctx: Pick<GQLContext, 'memberId'>
) => {
  const memberId = args?.memberId ?? ctx.memberId;

  const payments: MemberPayment[] = await new BloomManager().find(
    MemberPayment,
    { member: { id: memberId } },
    {
      cacheKey: `${QueryEvent.GET_PAYMENTS}-${memberId}`,
      orderBy: { createdAt: QueryOrder.DESC }
    }
  );

  return payments;
};

export default getMemberPayments;
