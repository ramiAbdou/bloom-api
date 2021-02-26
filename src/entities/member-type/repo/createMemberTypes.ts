import { ArgsType, Field, Float, InputType } from 'type-graphql';
import { EntityData } from '@mikro-orm/core';

import { GQLContext } from '@util/constants';
import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { FlushEvent } from '@util/events';
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
