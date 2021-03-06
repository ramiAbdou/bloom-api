import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';
import MemberRefresh from '../MemberRefresh';

const createMemberRefresh = async (
  ctx: Pick<GQLContext, 'memberId'>
): Promise<MemberRefresh> => {
  const { memberId } = ctx;

  const refresh: MemberRefresh = await new BloomManager().createAndFlush(
    MemberRefresh,
    { member: memberId },
    { flushEvent: MutationEvent.CREATE_MEMBER_REFRESH }
  );

  return refresh;
};

export default createMemberRefresh;
