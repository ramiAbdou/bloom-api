import { ArgsType, Field, InputType } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
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

interface DidHighlightedValueChangeArgs {
  data: MemberData[];
  updatedData: MemberData[];
}

const didHighlightedValueChange = ({
  data,
  updatedData
}: DidHighlightedValueChangeArgs) => {
  const highlightedData = data.find(({ question }: MemberData) => {
    return !!question.inDirectoryCard;
  })?.value;

  const updatedHighlightedData = updatedData.find(
    ({ question }: MemberData) => {
      return !!question.inDirectoryCard;
    }
  )?.value;

  return highlightedData !== updatedHighlightedData;
};

const updateMemberData = async (
  { items }: UpdateMemberDataArgs,
  { communityId, memberId, userId }: GQLContext
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

  await bm.flush({
    cacheKeysToInvalidate: [
      `${QueryEvent.GET_DATABASE}-${communityId}`,
      ...(didHighlightedValueChange({ data, updatedData })
        ? [`${QueryEvent.GET_DIRECTORY}-${communityId}`]
        : []),
      `${QueryEvent.GET_MEMBER_DATA}-${memberId}`,
      `${QueryEvent.GET_USER}-${userId}`
    ]
  });

  return updatedData;
};

export default updateMemberData;
