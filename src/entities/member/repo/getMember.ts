import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

@ArgsType()
export class GetMemberArgs {
  @Field({ nullable: true })
  memberId?: string;
}

const getMember = async (
  args: GetMemberArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<Member> => {
  const memberId = args?.memberId ?? ctx.memberId;

  return new BloomManager().findOneOrFail(
    Member,
    { id: memberId },
    { cacheKey: `${QueryEvent.GET_MEMBER}-${memberId}` }
  );
};

export default getMember;
