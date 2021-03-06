import BloomManager from '@core/db/BloomManager';
import MemberSocials from '@entities/member-socials/MemberSocials';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';

/**
 * Returns the MemberSocials of a Community.
 *
 * @param ctx.communityId - ID of the Community (authenticated).
 */
const getAllMemberSocials = async (
  ctx: Pick<GQLContext, 'communityId'>
): Promise<MemberSocials[]> => {
  const { communityId } = ctx;

  const socials: MemberSocials[] = await new BloomManager().find(
    MemberSocials,
    { member: { community: communityId } },
    { cacheKey: `${QueryEvent.GET_ALL_MEMBER_SOCIALS}-${communityId}` }
  );

  return socials;
};

export default getAllMemberSocials;
