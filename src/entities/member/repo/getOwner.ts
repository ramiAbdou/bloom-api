import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import Member, { MemberRole } from '@entities/member/Member';

@ArgsType()
export class GetOwnerArgs {
  @Field()
  communityId: string;
}

/**
 * Returns the owner of the Community.
 *
 * @param args.communityId - Identifier of the Community.
 */
const getOwner = async (args: GetOwnerArgs): Promise<Member> => {
  const owner: Member = await new BloomManager().findOne(Member, {
    community: args.communityId,
    role: MemberRole.OWNER
  });

  return owner;
};

export default getOwner;
