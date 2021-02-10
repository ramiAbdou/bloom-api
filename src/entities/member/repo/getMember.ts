import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

const getMember = async ({
  memberId
}: Pick<GQLContext, 'memberId'>): Promise<Member[]> => {
  return new BloomManager().findOne(
    Member,
    { id: memberId },
    {
      cacheKey: `${QueryEvent.GET_MEMBER}-${memberId}`,
      populate: ['user']
    }
  );
};

export default getMember;
