import { ArgsType, Field, InputType } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import { GQLContext } from '@util/constants';
import { QueryEvent } from '@util/events';
import MemberValue from '../MemberValue';

@InputType()
class MemberValueArgs {
  @Field()
  questionId: string;

  @Field(() => [String], { nullable: true })
  value: string[];
}

@ArgsType()
export class UpdateMemberValuesArgs {
  @Field(() => [MemberValueArgs])
  items: MemberValueArgs[];
}

const updateMemberValues = async (
  { items }: UpdateMemberValuesArgs,
  { communityId, memberId }: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberValue[]> => {
  const bm = new BloomManager();

  const data: MemberValue[] = await bm.find(MemberValue, {
    member: { id: memberId },
    question: { id: items.map(({ questionId }) => questionId) }
  });

  const updatedData: MemberValue[] = items.reduce(
    (acc: MemberValue[], { questionId, value }: MemberValueArgs) => {
      const stringifiedValue = value?.toString();

      const existingEntity: MemberValue = data.find(
        (element: MemberValue) => element.question.id === questionId
      );

      let entity: MemberValue = existingEntity;

      if (!entity) {
        entity = bm.create(MemberValue, {
          member: memberId,
          question: questionId
        });
      }

      entity.value = stringifiedValue;
      return [...acc, entity];
    },
    data
  );

  await bm.flush();

  cache.invalidateKeys([
    `${QueryEvent.GET_DATABASE}-${communityId}`,
    `${QueryEvent.GET_DIRECTORY}-${communityId}`
  ]);

  return updatedData;
};

export default updateMemberValues;
