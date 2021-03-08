import { ApplyToCommunityAdminsPayload } from 'src/system/emails/util/getApplyToCommunityAdminsVars';
import { ApplyToCommunityPayload } from 'src/system/emails/util/getApplyToCommunityVars';
import { ArgsType, Field, InputType } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import MemberIntegrations from '@entities/member-integrations/MemberIntegrations';
import updateStripePaymentMethodId from '@entities/member-integrations/repo/updateStripePaymentMethodId';
import MemberPlan, { RecurrenceType } from '@entities/member-plan/MemberPlan';
import MemberSocials from '@entities/member-socials/MemberSocials';
import MemberValue from '@entities/member-value/MemberValue';
import createLifetimePayment from '@entities/payment/repo/createLifetimePayment';
import createSubscription from '@entities/payment/repo/createSubscription';
import Question, {
  QuestionCategory,
  QuestionType
} from '@entities/question/Question';
import User from '@entities/user/User';
import { emitEmailEvent } from '@system/eventBus';
import { GQLContext } from '@util/constants';
import { EmailEvent, MutationEvent } from '@util/events';
import Member from '../Member';

@InputType()
export class MemberValueInput {
  @Field(() => String, { nullable: true })
  category?: QuestionCategory;

  @Field({ nullable: true })
  questionId: string;

  @Field(() => [String], { nullable: true })
  value: string[];
}

@ArgsType()
export class ApplyToCommunityArgs {
  @Field(() => [MemberValueInput])
  data: MemberValueInput[];

  @Field()
  email: string;

  @Field({ nullable: true })
  memberPlanId?: string;

  @Field({ nullable: true })
  paymentMethodId?: string;

  @Field()
  urlName: string;
}

interface CreateApplicationPaymentArgs {
  memberPlanId: string;
  paymentMethodId: string;
  recurrence: RecurrenceType;
}

/**
 * Creates the application payment for the incoming member. If no payment
 * method ID is provided, nothing happens. If the recurrence is LIFETIME,
 * creates a one-time payment, and otherwise creates a subscription.
 *
 * @param args.memberPlanId Type ID to apply for.
 * @param args.paymentMethodId ID of the Stripe Payment Method.
 * @param args.recurrence Recurrence of the new type to apply to.
 * @param ctx.communityId ID of the community.
 * @param ctx.memberId ID of the member.
 */
const createApplicationPayment = async (
  args: CreateApplicationPaymentArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Member> => {
  const { memberPlanId, paymentMethodId, recurrence } = args;

  if (!paymentMethodId) return;

  try {
    await updateStripePaymentMethodId({ paymentMethodId }, ctx);

    if (recurrence === RecurrenceType.LIFETIME) {
      await createLifetimePayment({ memberPlanId }, ctx);
      return;
    }

    await createSubscription({ memberPlanId }, ctx);
  } catch (e) {
    await new BloomManager().findOneAndDelete(Member, { id: ctx.memberId });
    throw new Error(`There was a problem processing your payment.`);
  }
};

/**
 * Applies for member in the community using the given email and data.
 * A user is either created OR fetched based on the email.
 */
const applyToCommunity = async (
  args: ApplyToCommunityArgs,
  ctx: Pick<GQLContext, 'res'>
): Promise<Member> => {
  const { data, email, memberPlanId, paymentMethodId, urlName } = args;

  const bm = new BloomManager();

  const queryArgs: FilterQuery<MemberPlan> = memberPlanId || {
    community: { urlName }
  };

  // Populate the questions and types so that we can capture the member
  // data in a relational manner.
  const [community, plan]: [Community, MemberPlan] = await Promise.all([
    bm.findOne(Community, { urlName }, { populate: ['questions'] }),
    bm.findOne(MemberPlan, queryArgs)
  ]);

  // The user can potentially already exist if they are a part of other
  // communities.
  const [user] = await bm.findOneOrCreate(User, { email }, { email });

  if (await bm.findOne(Member, { community, user })) {
    throw new Error(
      `This email is already registered in the ${community.name} community.`
    );
  }

  const member: Member = bm.create(Member, {
    community,
    email,
    memberIntegrations: bm.create(MemberIntegrations, {}),
    user
  });

  const socials: MemberSocials = bm.create(MemberSocials, { member });

  const questions = community.questions.getItems();

  // Some data we store on the user entity, and some we store as member
  // data.
  data.forEach(({ category, questionId, value: values }: MemberValueInput) => {
    // If there's no value, then short circuit. Because for the initial
    // creation of data, it must exist.
    if (!values?.length) return;

    const question: Question = questions.find((element) => {
      return (
        questionId === element.id || (category && category === element.category)
      );
    });

    category = category ?? question.category;

    const value = (question?.type === QuestionType.MULTIPLE_SELECT
      ? values
      : values[0]
    )?.toString();

    if (category === QuestionCategory.EMAIL) user.email = value;
    else if (category === QuestionCategory.FIRST_NAME) {
      member.firstName = value;
    } else if (category === QuestionCategory.LAST_NAME) {
      member.lastName = value;
    } else if (category === QuestionCategory.LINKED_IN_URL) {
      socials.linkedInUrl = value;
    } else if (category === QuestionCategory.MEMBER_PLAN) {
      member.plan = plan;
    } else bm.create(MemberValue, { member, question, value });
  });

  await bm.flush({ flushEvent: MutationEvent.APPLY_TO_COMMUNITY });

  emitEmailEvent(EmailEvent.APPLY_TO_COMMUNITY, {
    communityId: community.id,
    memberId: member.id
  } as ApplyToCommunityPayload);

  emitEmailEvent(EmailEvent.APPLY_TO_COMMUNITY_ADMINS, {
    applicantId: member.id,
    communityId: community.id
  } as ApplyToCommunityAdminsPayload);

  await createApplicationPayment(
    { memberPlanId, paymentMethodId, recurrence: plan.recurrence },
    { communityId: community.id, memberId: member.id }
  );

  ctx.res.clearCookie('accessToken');
  ctx.res.clearCookie('refreshToken');

  return member;
};

export default applyToCommunity;
