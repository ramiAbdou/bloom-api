import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { cleanObject } from '@util/util';
import Member from '../Member';

@ArgsType()
export class UpdateMemberArgs {
  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  pictureUrl?: string;
}

/**
 * Returns the updated Member.
 *
 * @param args.bio Bio of the Member.
 * @param args.firstName First name of the Member.
 * @param args.lastName Last name of the Member.
 * @param args.pictureUrl Profile picture URL of the Member.
 * @param ctx.memberId ID of the Member (authenticated).
 */
const updateMember = async (
  args: UpdateMemberArgs,
  ctx: Pick<GQLContext, 'memberId'>
): Promise<Member> => {
  const { memberId } = ctx;

  const updatedMember: Member = await new BloomManager().findOneAndUpdate(
    Member,
    memberId,
    cleanObject(args)
  );

  return updatedMember;
};

export default updateMember;
