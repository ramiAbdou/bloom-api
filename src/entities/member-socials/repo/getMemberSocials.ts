import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import MemberSocials from '@entities/member-socials/MemberSocials';
import { QueryEvent } from '@util/constants.events';

@ArgsType()
export class GetMemberSocialsArgs {
  @Field({ nullable: true })
  memberId?: string;
}

/**
 * Returns the MemberSocials.
 *
 * @param args.memberId - ID of the Member.
 */
const getMemberSocials = async (
  args: GetMemberSocialsArgs
): Promise<MemberSocials> => {
  const { memberId } = args;

  const socials: MemberSocials = await new BloomManager().findOne(
    MemberSocials,
    { member: memberId },
    { cacheKey: `${QueryEvent.GET_MEMBER_SOCIALS}-${memberId}` }
  );

  return socials;
};

export default getMemberSocials;
