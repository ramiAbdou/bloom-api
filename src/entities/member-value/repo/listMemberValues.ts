import { ArgsType, Field } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import MemberValue from '@entities/member-value/MemberValue';
import { QueryEvent } from '@util/constants.events';

@ArgsType()
export class ListMemberValuesArgs {
  @Field({ nullable: true })
  communityId?: string;

  @Field({ nullable: true })
  memberId?: string;
}

/**
 * Returns the MemberValue(s). Note that this returns an array.
 *
 * @param args.communityId - ID of the Community.
 * @param args.memberId - ID of the Member.
 */
const listMemberValues = async (
  args: ListMemberValuesArgs
): Promise<MemberValue[]> => {
  const { communityId, memberId } = args;

  const queryArgs: FilterQuery<MemberValue> = communityId
    ? { member: { community: communityId } }
    : { member: memberId };

  const values: MemberValue[] = await new BloomManager().find(
    MemberValue,
    { ...queryArgs },
    {
      cacheKey: communityId
        ? `${QueryEvent.LIST_MEMBER_VALUES}-${communityId}`
        : `${QueryEvent.LIST_MEMBER_VALUES}-${memberId}`
    }
  );

  return values;
};

export default listMemberValues;
