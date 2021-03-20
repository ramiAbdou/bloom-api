import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import MemberSocials from '@entities/member-socials/MemberSocials';
import { QueryEvent } from '@util/constants.events';

@ArgsType()
export class GetMemberSocialsArgs {
  @Field({ nullable: true })
  communityId?: string;

  @Field({ nullable: true })
  memberId?: string;
}

/**
 * Returns the MemberSocials(s). Note this returns an array.
 *
 * @param args.communityId - ID of the Community.
 * @param args.memberId - ID of the Member.
 */
const getMemberSocials = async (
  args: GetMemberSocialsArgs
): Promise<MemberSocials[]> => {
  const { communityId, memberId } = args;

  const queryArgs = communityId
    ? { member: { community: communityId } }
    : { member: memberId };

  const socials: MemberSocials[] = await new BloomManager().find(
    MemberSocials,
    { ...queryArgs },
    {
      cacheKey: communityId
        ? `${QueryEvent.GET_MEMBER_SOCIALS}-${communityId}`
        : `${QueryEvent.GET_MEMBER_SOCIALS}-${memberId}`
    }
  );

  return socials;
};

export default getMemberSocials;
