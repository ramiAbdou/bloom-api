import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';

const getMemberFirstName = async (
  args: Pick<GQLContext, 'communityId' | 'memberId'>
) => {
  const question = await new BloomManager().findOne();
};

export default getMemberFirstName;
