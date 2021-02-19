import { ArgsType, Field, InputType } from 'type-graphql';

import { GQLContext } from '@constants';
import { QueryEvent } from '@util/events';
import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import MemberData from '../MemberData';

@InputType()
class MemberDataArgs {
  @Field()
  questionId: string;

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
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberData[]> => {
  const bm = new BloomManager();

  const data: MemberData[] = await bm.find(MemberData, {
    member: { id: memberId },
    question: { id: items.map(({ questionId }) => questionId) }
  });

  const updatedData: MemberData[] = items.reduce(
    (acc: MemberData[], { questionId, value }: MemberDataArgs) => {
      const stringifiedValue = value?.toString();

      const existingEntity: MemberData = data.find(
        (element: MemberData) => element.question.id === questionId
      );

      let entity: MemberData = existingEntity;

      if (!entity) {
        entity = bm.create(MemberData, {
          member: { id: memberId },
          question: { id: questionId }
        });
      }

      entity.value = stringifiedValue;
      return [...acc, entity];
    },
    data
  );

  await bm.flush();

  cache.invalidateEntries([
    `${QueryEvent.GET_DATABASE}-${communityId}`,
    `${QueryEvent.GET_DIRECTORY}-${communityId}`
  ]);

  return updatedData;
};

export default updateMemberData;
