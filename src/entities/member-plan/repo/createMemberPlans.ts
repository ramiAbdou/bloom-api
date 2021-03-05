import { ArgsType, Field, Float, InputType } from 'type-graphql';
import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import { GQLContext } from '@util/constants';
import { FlushEvent } from '@util/events';
import MemberPlan, { RecurrenceType } from '../MemberPlan';

@InputType()
export class CreateMemberPlanInput {
  @Field(() => Float, { defaultValue: 0.0 })
  amount?: number;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  recurrence?: RecurrenceType;
}

@ArgsType()
export class CreateMemberPlansArgs {
  @Field()
  defaultPlanName: string;

  @Field(() => [CreateMemberPlanInput])
  plans: CreateMemberPlanInput[];
}

const createMemberPlans = async (
  { defaultPlanName, plans: initialPlans }: CreateMemberPlansArgs,
  { communityId }: Pick<GQLContext, 'communityId'>
) => {
  const bm = new BloomManager();
  const community: Community = await bm.findOne(Community, { id: communityId });

  let defaultType: MemberPlan;

  const plans: MemberPlan[] = initialPlans.map(
    (type: EntityData<MemberPlan>) => {
      const persistedType: MemberPlan = bm.create(MemberPlan, {
        ...type,
        community: communityId
      });

      if (persistedType.name === defaultPlanName) defaultType = persistedType;
      return persistedType;
    }
  );

  if (defaultType) community.defaultType = defaultType;

  await bm.flush({ flushEvent: FlushEvent.CREATE_MEMBER_TYPES });

  return plans;
};

export default createMemberPlans;
