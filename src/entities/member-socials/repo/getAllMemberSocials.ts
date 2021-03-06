import BloomManager from '@core/db/BloomManager';
import MemberSocials from '@entities/member-socials/MemberSocials';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';

const getAllMemberSocials = async ({
  communityId
}: Pick<GQLContext, 'communityId'>): Promise<MemberSocials[]> => {
  const allSocials: MemberSocials[] = await new BloomManager().find(
    MemberSocials,
    { member: { community: communityId } },
    { cacheKey: `${QueryEvent.GET_MEMBER_SOCIALS}-${communityId}` }
  );

  return allSocials;
};

export default getAllMemberSocials;
