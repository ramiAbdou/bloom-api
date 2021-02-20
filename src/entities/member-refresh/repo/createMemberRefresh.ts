import BloomManager from '@core/db/BloomManager';
import { MemberIdArgs } from '@entities/member/Member.types';
import { FlushEvent } from '@util/events';
import MemberRefresh from '../MemberRefresh';

const createMemberRefresh = async ({
  memberId
}: MemberIdArgs): Promise<MemberRefresh> => {
  const refresh: MemberRefresh = await new BloomManager().createAndFlush(
    MemberRefresh,
    { member: memberId },
    { flushEvent: FlushEvent.CREATE_MEMBER_REFRESH }
  );

  return refresh;
};

export default createMemberRefresh;
