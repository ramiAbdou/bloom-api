import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
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
    {
      cacheKey: `${QueryEvent.GET_MEMBER}-${memberId}`,
      populate: ['community', 'type', 'user']
    }
  );
};

export default getMember;
