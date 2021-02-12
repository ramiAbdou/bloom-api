import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import MemberData from '../MemberData';

@ArgsType()
export class GetMemberDataArgs {
  @Field({ nullable: true })
  memberId?: string;
}

const getMemberData = async (
  args: GetMemberDataArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<MemberData[]> => {
  const memberId: string = args?.memberId ?? ctx.memberId;

  return new BloomManager().find(
    MemberData,
    { member: { id: memberId } },
    { cacheKey: `${QueryEvent.GET_MEMBER_DATA}-${memberId}` }
  );
};

export default getMemberData;
