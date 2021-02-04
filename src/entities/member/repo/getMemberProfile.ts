import { ArgsType, Field } from 'type-graphql';

import { QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

@ArgsType()
export class GetMemberProfileArgs {
  @Field()
  memberId: string;
}

const getMemberProfile = async ({ memberId }: GetMemberProfileArgs) => {
  return new BloomManager().findOneOrFail(
    Member,
    { id: memberId },
    {
      cacheKey: `${QueryEvent.GET_MEMBER_PROFILE}-${memberId}`,
      populate: ['data.question', 'type', 'user']
    }
  );
};

export default getMemberProfile;
