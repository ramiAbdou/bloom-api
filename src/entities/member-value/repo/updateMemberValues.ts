import { ArgsType, Field, InputType } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import { GQLContext } from '@util/constants';
import { MutationEvent } from '@util/events';
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

/**
 * Updates the MemberValue(s).
 *
 * @param args.items.questionId - ID of the Question.
 * @param args.items.value - Value to update in the MemberValue.
 * @param ctx.communityId - ID of the Community.
 * @param ctx.memberId - ID of the Member.
 */
const updateMemberValues = async (
  args: UpdateMemberValuesArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<MemberValue[]> => {
  const { items } = args;
  const { memberId } = ctx;

  // Need to find all of the Question(s) with these ID's.
  const questionIds: string[] = items.map(({ questionId }) => questionId);

  const bm = new BloomManager();

  const values: MemberValue[] = await bm.find(MemberValue, {
    member: memberId,
    question: questionIds
  });

  const updatedValues: MemberValue[] = items.reduce(
    (acc: MemberValue[], { questionId, value }: MemberValueArgs) => {
      const stringifiedValue = value?.toString();

      const existingEntity: MemberValue = values.find(
        (element: MemberValue) => {
          return element.question.id === questionId;
        }
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

  await bm.flush({ flushEvent: MutationEvent.UPDATE_MEMBER_VALUES });

  return updatedValues;
};

export default updateMemberValues;
