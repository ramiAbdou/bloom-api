import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/constants.events';
import Member from '../Member';

@ArgsType()
export class GetMemberArgs {
  @Field({ nullable: true })
  memberId?: string;
}

/**
 * Returns the Member.
 *
 * @param args.memberId - ID of the Member.
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const getMember = async (
  args: GetMemberArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<Member> => {
  const memberId = args.memberId ?? ctx.memberId;

  const member: Member = await new BloomManager().findOneOrFail(
    Member,
    memberId,
    { cacheKey: `${QueryEvent.GET_MEMBERS}-${memberId}` }
  );

  return member;
};

export default getMember;
