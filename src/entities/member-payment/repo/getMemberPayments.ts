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
  return new BloomManager().find(
    MemberPayment,
    { member: { id: memberId ?? ctx.memberId } },
    {
      cacheKey: `${QueryEvent.GET_MEMBER_PAYMENTS}-${memberId}`,
      orderBy: { createdAt: QueryOrder.DESC },
      populate: ['member']
    }
  );
};

export default getMemberPayments;
