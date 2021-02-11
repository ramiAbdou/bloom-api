import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

const getMember = async ({
  memberId
}: Pick<GQLContext, 'memberId'>): Promise<Member> => {
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
