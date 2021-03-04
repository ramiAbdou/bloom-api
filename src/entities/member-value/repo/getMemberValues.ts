import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import MemberValue from '../MemberValue';

@ArgsType()
export class GetMemberValueArgs {
  @Field({ nullable: true })
  memberId?: string;
}

const getMemberValues = async (
  args: GetMemberValueArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<MemberValue[]> => {
  const memberId: string = args?.memberId ?? ctx.memberId;

  return new BloomManager().find(
    MemberValue,
    { member: { id: memberId } },
    { cacheKey: `${QueryEvent.GET_MEMBER_VALUES}-${memberId}` }
  );
};

export default getMemberValues;
