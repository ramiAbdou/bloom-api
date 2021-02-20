import { ArgsType, Field, Float, InputType } from 'type-graphql';
import { EntityData } from '@mikro-orm/core';

import { GQLContext } from '@constants';
import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import Community from '@entities/community/Community';
import MemberType from '../MemberType';
import { RecurrenceType } from '../MemberType.types';

@InputType()
export class CreateMemberTypeInput {
  @Field(() => Float, { defaultValue: 0.0 })
  amount: number;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  recurrence?: RecurrenceType;
}

@ArgsType()
export class CreateMemberTypesArgs {
  @Field()
  defaultTypeName: string;

  @Field(() => [CreateMemberTypeInput])
  types: CreateMemberTypeInput[];
}

const createMemberTypes = async (
  { defaultTypeName, types: initialTypes }: CreateMemberTypesArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
) => {
  const bm = new BloomManager();
  const community: Community = await bm.findOne(Community, { id: communityId });

  let defaultType: MemberType;

  const types: MemberType[] = initialTypes.map(
    (type: EntityData<MemberType>) => {
      const persistedType: MemberType = bm.create(MemberType, {
        ...type,
        community: communityId
      });

      if (persistedType.name === defaultTypeName) defaultType = persistedType;
      return persistedType;
    }
  );

  if (defaultType) community.defaultType = defaultType;

  await bm.flush({ flushEvent: FlushEvent.CREATE_MEMBER_TYPES });

  return types;
};

export default createMemberTypes;
