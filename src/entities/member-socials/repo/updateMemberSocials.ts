import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import MemberSocials from '../MemberSocials';

@ArgsType()
export class UpdateMemberSocialsArgs {
  @Field({ nullable: true })
  facebookUrl?: string;

  @Field({ nullable: true })
  instagramUrl?: string;

  @Field({ nullable: true })
  linkedInUrl?: string;

  @Field({ nullable: true })
  twitterUrl?: string;
}

/**
 * Returns the updated MemberSocials.
 *
 * @param args.facebookUrl Facebook URL of the Member.
 * @param args.instagramUrl Instagram URL of the Member.
 * @param args.linkedInUrl LinkedIn URL of the Member.
 * @param ctx.memberId ID of the Member (authenticated).
 */
const updateMemberSocials = async (
  args: UpdateMemberSocialsArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<MemberSocials> => {
  const { memberId } = ctx;

  const socials: MemberSocials = await new BloomManager().findOneAndUpdate(
    MemberSocials,
    { member: memberId },
    { ...args }
  );

  return socials;
};

export default updateMemberSocials;
