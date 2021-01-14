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
  { communityId, memberId, userId }: GQLContext
): Promise<MemberData[]> => {
  const bm = new BloomManager();

  const data: MemberData[] = await bm.find(MemberData, {
    member: { id: memberId },
    question: { id: items.map(({ id }) => id) }
  });

  const updatedData: MemberData[] = items.reduce(
    (acc: MemberData[], item: MemberDataArgs) => {
      const value = item.value?.toString();

      const dataPoint: MemberData =
        data.find((element: MemberData) => element.question.id === item.id) ??
        bm.create(MemberData, {
          member: { id: memberId },
          question: { id: item.id }
        });

      dataPoint.value = value;
      return [...acc, dataPoint];
    },
    data
  );

  await bm.flush();

  cache.invalidateEntries([
    `${QueryEvent.GET_DIRECTORY}-${communityId}`,
    `${QueryEvent.GET_MEMBERS}-${communityId}`,
    `${QueryEvent.GET_USER}-${userId}`
  ]);

  return updatedData;
};

export default updateMemberData;
