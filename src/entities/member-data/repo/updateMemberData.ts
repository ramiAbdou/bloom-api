import { ArgsType, Field, InputType } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import MemberData from '../MemberData';

@InputType()
class MemberDataArgs {
  @Field()
  id: string;

  @Field(() => [String], { nullable: true })
  value: string[];
}

@ArgsType()
export class UpdateMemberDataArgs {
  @Field(() => [MemberDataArgs])
  items: MemberDataArgs[];
}

const updateMemberData = async (
  { items }: UpdateMemberDataArgs,
  { communityId, userId }: GQLContext
): Promise<MemberData[]> => {
  const bm = new BloomManager();

  const data: MemberData[] = await bm.find(MemberData, {
    id: items.map(({ id }) => id)
  });

  data.forEach((d: MemberData) => {
    const value = items.find((item) => item.id === d.id)?.value;
    d.value = value.toString();
  });

  await bm.flush();

  cache.invalidateEntries([
    `${QueryEvent.GET_DIRECTORY}-${communityId}`,
    `${QueryEvent.GET_MEMBERS}-${communityId}`,
    `${QueryEvent.GET_USER}-${userId}`
  ]);

  return data;
};

export default updateMemberData;
