import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import { GQLContext } from '@util/constants';
import { MutationEvent, QueryEvent } from '@util/events';
import MemberSocials from '../MemberSocials';

@ArgsType()
export class UpdateMemberSocialsArgs {
  @Field({ nullable: true })
  clubhouseUrl?: string;

  @Field({ nullable: true })
  facebookUrl?: string;

  @Field({ nullable: true })
  instagramUrl?: string;

  @Field({ nullable: true })
  linkedInUrl?: string;

  @Field({ nullable: true })
  twitterUrl?: string;
}

const updateMemberSocials = async (
  args: UpdateMemberSocialsArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberSocials> => {
  const { communityId, memberId } = ctx;

  const socials: MemberSocials = await new BloomManager().findOneAndUpdate(
    MemberSocials,
    { member: memberId },
    args,
    { flushEvent: MutationEvent.UPDATE_MEMBER_SOCIALS }
  );

  cache.invalidateKeys([
    `${QueryEvent.GET_MEMBER_SOCIALS}-${memberId}`,
    `${QueryEvent.GET_MEMBER_SOCIALS}-${communityId}`
  ]);

  return socials;
};

export default updateMemberSocials;
