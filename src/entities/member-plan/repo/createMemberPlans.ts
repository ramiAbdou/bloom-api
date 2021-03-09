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
  args: CreateMemberPlansArgs,
  ctx: Pick<GQLContext, 'communityId'>
): Promise<MemberPlan[]> => {
  const { defaultPlanName, plans: initialPlans } = args;
  const { communityId } = ctx;

  const bm = new BloomManager();
  const community: Community = await bm.findOne(Community, communityId);

  let defaultType: MemberPlan;

  const plans: MemberPlan[] = initialPlans.map(
    (plan: EntityData<MemberPlan>) => {
      const persistedPlan: MemberPlan = bm.create(MemberPlan, {
        ...plan,
        community: communityId
      });

      if (persistedPlan.name === defaultPlanName) defaultType = persistedPlan;
      return persistedPlan;
    }
  );

  if (defaultType) community.defaultType = defaultType;

  await bm.flush({ flushEvent: FlushEvent.CREATE_MEMBER_PLANS });

  return plans;
};

export default createMemberPlans;
