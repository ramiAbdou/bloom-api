import { ArgsType, Field } from 'type-graphql';
import { QueryOrder } from '@mikro-orm/core';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import MemberPayment from '../MemberPayment';

@ArgsType()
export class GetMemberPaymentsArgs {
  @Field({ nullable: true })
  memberId?: string;
}

const getMemberPayments = async (
  { memberId }: GetMemberPaymentsArgs,
  ctx: Pick<GQLContext, 'memberId'>
) => {
  memberId = memberId ?? ctx.memberId;

  const payments: MemberPayment[] = await new BloomManager().find(
    MemberPayment,
    { member: { id: memberId } },
    {
      cacheKey: `${QueryEvent.GET_MEMBER_PAYMENTS}-${memberId}`,
      orderBy: { createdAt: QueryOrder.DESC },
      populate: ['member']
    }
  );

  return payments;
};

export default getMemberPayments;
