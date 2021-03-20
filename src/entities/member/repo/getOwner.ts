import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Member, { MemberRole } from '@entities/member/Member';
import { QueryEvent } from '@util/constants.events';

@ArgsType()
export class GetOwnerArgs {
  @Field()
  communityId: string;
}

/**
 * Returns the Member with OWNER role in the Community.
 *
 * @param args.communityId - ID of the Community.
 */
const getOwner = async (args: GetOwnerArgs): Promise<Member> => {
  const { communityId } = args;

  const owner: Member = await new BloomManager().findOne(
    Member,
    { community: communityId, role: MemberRole.OWNER },
    { cacheKey: `${QueryEvent.GET_OWNER}-${communityId}` }
  );

  return owner;
};

export default getOwner;
