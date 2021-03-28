import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import MemberSocials from '@entities/member-socials/MemberSocials';
import { QueryEvent } from '@util/constants.events';

@ArgsType()
export class ListMemberSocialsArgs {
  @Field({ nullable: true })
  communityId?: string;
}

/**
 * Returns the MemberSocials(s).
 *
 * @param args.communityId - ID of the Community.
 */
const listMemberSocials = async (
  args: ListMemberSocialsArgs
): Promise<MemberSocials[]> => {
  const { communityId } = args;

  const socials: MemberSocials[] = await new BloomManager().find(
    MemberSocials,
    { member: { community: communityId } },
    { cacheKey: `${QueryEvent.LIST_MEMBER_SOCIALS}-${communityId}` }
  );

  return socials;
};

export default listMemberSocials;
