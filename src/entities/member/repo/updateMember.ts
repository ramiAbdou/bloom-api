import { ArgsType, Field } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';
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
 * Returns the updated MEMBER, instead of the updated user so that React App
 * can more easily update it's global state with updated data.
 *
 * @param args.bio Bio of the member.
 */
const updateMember = async (
  args: UpdateMemberArgs,
  { memberId }: Pick<GQLContext, 'memberId'>
): Promise<Member> => {
  const updatedMember: Member = await new BloomManager().findOneAndUpdate(
    Member,
    memberId,
    args,
    { flushEvent: MutationEvent.UPDATE_MEMBER }
  );

  return updatedMember;
};

export default updateMember;
