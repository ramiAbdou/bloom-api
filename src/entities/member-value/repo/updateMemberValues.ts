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
  args: UpdateMemberValuesArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberValue[]> => {
  const { items } = args;
  const { communityId, memberId } = ctx;

  const bm = new BloomManager();

  const values: MemberValue[] = await bm.find(MemberValue, {
    member: memberId,
    question: items.map(({ questionId }) => questionId)
  });

  const updatedValues: MemberValue[] = items.reduce(
    (acc: MemberValue[], { questionId, value }: MemberValueArgs) => {
      const stringifiedValue = value?.toString();

      const existingEntity: MemberValue = values.find(
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
    values
  );

  await bm.flush();

  cache.invalidateKeys([
    `${QueryEvent.GET_DATABASE}-${communityId}`,
    `${QueryEvent.GET_DIRECTORY}-${communityId}`
  ]);

  return updatedValues;
};

export default updateMemberValues;
