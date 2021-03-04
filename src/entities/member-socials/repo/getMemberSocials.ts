import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import MemberSocials from '@entities/member-socials/MemberSocials';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';

@ArgsType()
export class GetMemberSocialsArgs {
  @Field({ nullable: true })
  userId?: string;
}

const getMemberSocials = async (
  args: GetMemberSocialsArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<MemberSocials> => {
  const memberId: string = args?.userId ?? ctx.memberId;

  const socials: MemberSocials = await new BloomManager().findOneOrFail(
    MemberSocials,
    { member: memberId },
    { cacheKey: `${QueryEvent.GET_MEMBER_SOCIALS}-${memberId}` }
  );

  return socials;
};

export default getMemberSocials;
