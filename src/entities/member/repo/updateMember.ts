import { ArgsType, Field } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
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
 * Invalidates GET_MEMBER and GET_MEMBER calls.
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
    {
      cacheKeysToInvalidate: [
        `${QueryEvent.GET_MEMBER}-${memberId}`,
        ...(args.bio ? [`${QueryEvent.GET_MEMBER}-${memberId}`] : [])
      ],
      event: 'UPDATE_MEMBER'
    }
  );
};

export default updateMember;
