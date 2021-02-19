import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import { MemberIdArgs } from '../../member/Member.types';
import MemberRefresh from '../MemberRefresh';

const createMemberRefresh = async ({
  memberId
}: MemberIdArgs): Promise<MemberRefresh> => {
  const bm = new BloomManager();
  const refresh = bm.create(MemberRefresh, { member: { id: memberId } });
  await bm.flush({ flushEvent: FlushEvent.CREATE_MEMBER_REFRESH });
  return refresh;
};

export default createMemberRefresh;
