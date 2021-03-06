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

/**
 * Returns the MemberValue(s).
 *
 * @param args.memberId - ID of the Member.
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const getMemberValues = async (
  args: GetMemberValueArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<MemberValue[]> => {
  const memberId: string = args.memberId ?? ctx.memberId;

  const values: MemberValue[] = await new BloomManager().find(
    MemberValue,
    { member: memberId },
    { cacheKey: `${QueryEvent.GET_MEMBER_VALUES}-${memberId}` }
  );

  return values;
};

export default getMemberValues;
