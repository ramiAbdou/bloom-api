import { ArgsType, Field } from 'type-graphql';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import Member from '../Member';

@ArgsType()
export class UpdateMemberArgs {
  @Field(() => Boolean, { nullable: true })
  autoRenew?: boolean;

  @Field({ nullable: true })
  bio?: string;
}

/**
 * Returns the updated MEMBER, instead of the updated user so that React App
 * can more easily update it's global state with updated data.
 *
 * @param args.bio Bio of the member.
 */
const updateMember = async (
  args: UpdateMemberArgs,
  { memberId }: Pick<GQLContext, 'memberId'>
): Promise<Member> => {
  return new BloomManager().findOneAndUpdate(
    Member,
    { id: memberId },
    { ...args },
    { event: 'UPDATE_MEMBER' }
  );
};

export default updateMember;
