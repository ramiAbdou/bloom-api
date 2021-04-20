import { ArgsType, Field, Float, InputType } from 'type-graphql';
import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { GQLContext } from '@util/constants';
import MemberType, { RecurrenceType } from '../MemberType';

@InputType()
export class CreateMemberTypeInput {
  @Field(() => Float, { defaultValue: 0.0 })
  amount?: number;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  recurrence?: RecurrenceType;
}

@ArgsType()
export class CreateMemberTypesArgs {
  @Field()
  defaultMemberTypeName: string;

  @Field(() => [CreateMemberTypeInput])
  memberTypes: CreateMemberTypeInput[];
}

const createMemberTypes = async (
  args: CreateMemberTypesArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<MemberType[]> => {
  const { defaultMemberTypeName, memberTypes: initialMemberTypes } = args;
  const { communityId } = ctx;

  const bm: BloomManager = new BloomManager();
  const community: Community = await bm.em.findOne(Community, communityId);

  let defaultType: MemberType;

  const memberTypes: MemberType[] = initialMemberTypes.map(
    (memberType: EntityData<MemberType>) => {
      const persistedMemberType: MemberType = bm.create(MemberType, {
        ...memberType,
        community: communityId
      });

      if (persistedMemberType.name === defaultMemberTypeName) {
        defaultType = persistedMemberType;
      }

      return persistedMemberType;
    }
  );

  if (defaultType) community.defaultType = defaultType;

  await bm.em.flush();

  return memberTypes;
};

export default createMemberTypes;
