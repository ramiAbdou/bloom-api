import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import MemberRefresh from '../MemberRefresh';

/**
 * Returns a MemberRefresh.
 *
 * @param ctx.memberId - ID of the Member (authenticated).
 */
const createMemberRefresh = async (
  ctx: Pick<GQLContext, 'memberId'>
): Promise<MemberRefresh> => {
  const { memberId } = ctx;

  const refresh: MemberRefresh = await new BloomManager().createAndFlush(
    MemberRefresh,
    { member: memberId }
  );

  return refresh;
};

export default createMemberRefresh;
