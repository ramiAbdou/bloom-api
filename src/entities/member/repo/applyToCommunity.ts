import { ApplyToCommunityAdminsPayload } from 'src/system/emails/util/getApplyToCommunityAdminsVars';
import { ApplyToCommunityPayload } from 'src/system/emails/util/getApplyToCommunityVars';
import { ArgsType, Field, InputType } from 'type-graphql';

import BloomManager from '@core/db/BloomManager';
import cache from '@core/db/cache';
import Community from '@entities/community/Community';
import createLifetimePayment from '@entities/member-payment/repo/createLifetimePayment';
import createSubscription from '@entities/member-payment/repo/createSubscription';
import MemberType, { RecurrenceType } from '@entities/member-type/MemberType';
import MemberValue from '@entities/member-value/MemberValue';
import Question, { QuestionCategory } from '@entities/question/Question';
import User from '@entities/user/User';
import { emitEmailEvent } from '@system/eventBus';
import { GQLContext } from '@util/constants';
import { EmailEvent, FlushEvent, QueryEvent } from '@util/events';
import Member, { MemberStatus } from '../Member';
import updatePaymentMethod from './updatePaymentMethod';

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
  memberTypeId?: string;

  @Field({ nullable: true })
  paymentMethodId?: string;

  @Field()
  urlName: string;
}

interface CreateApplicationPaymentArgs {
  memberTypeId: string;
  paymentMethodId: string;
  recurrence: RecurrenceType;
}

/**
 * Creates the application payment for the incoming member. If no payment
 * method ID is provided, nothing happens. If the recurrence is LIFETIME,
 * creates a one-time payment, and otherwise creates a subscription.
 *
 * @param args.memberTypeId Type ID to apply for.
 * @param args.paymentMethodId ID of the Stripe Payment Method.
 * @param args.recurrence Recurrence of the new type to apply to.
 * @param ctx.communityId ID of the community.
 * @param ctx.memberId ID of the member.
 */
const createApplicationPayment = async (
  { memberTypeId, paymentMethodId, recurrence }: CreateApplicationPaymentArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
) => {
  if (!paymentMethodId) return;

  try {
    await updatePaymentMethod({ paymentMethodId }, ctx);

    if (recurrence === RecurrenceType.LIFETIME) {
      await createLifetimePayment({ memberTypeId }, ctx);
      return;
    }

    await createSubscription({ memberTypeId }, ctx);
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
  { data, email, memberTypeId, paymentMethodId, urlName }: ApplyToCommunityArgs,
  ctx: Pick<GQLContext, 'res'>
): Promise<Member> => {
  const bm = new BloomManager();

  // Populate the questions and types so that we can capture the member
  // data in a relational manner.
  const [community, type]: [Community, MemberType] = await Promise.all([
    bm.findOne(Community, { urlName }, { populate: ['questions'] }),
    bm.findOne(
      MemberType,
      memberTypeId ? { id: memberTypeId } : { community: { urlName } }
    )
  ]);

  // The user can potentially already exist if they are a part of other
  // communities.
  const [user] = await bm.findOneOrCreate(User, { email }, { email });

  if (await bm.findOne(Member, { community, user })) {
    throw new Error(
      `This email is already registered in the ${community.name} community.`
    );
  }

  const member: Member = bm.create(Member, { community, email, user });

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

    const value = (question?.type === 'MULTIPLE_SELECT'
      ? values
      : values[0]
    )?.toString();

    if (category === QuestionCategory.EMAIL) user.email = value;
    else if (category === QuestionCategory.FIRST_NAME) {
      member.firstName = value;
    } else if (category === QuestionCategory.LAST_NAME) {
      member.lastName = value;
    } else if (category === QuestionCategory.LINKED_IN_URL) {
      user.linkedInUrl = value;
    } else if (category === QuestionCategory.MEMBERSHIP_TYPE) {
      member.type = type;
    } else bm.create(MemberValue, { member, question, value });
  });

  await bm.flush({ flushEvent: FlushEvent.APPLY_TO_COMMUNITY });

  emitEmailEvent(EmailEvent.APPLY_TO_COMMUNITY, {
    communityId: community.id,
    memberId: member.id
  } as ApplyToCommunityPayload);

  emitEmailEvent(EmailEvent.APPLY_TO_COMMUNITY_ADMINS, {
    applicantId: member.id,
    communityId: community.id
  } as ApplyToCommunityAdminsPayload);

  cache.invalidateKeys(
    member.status === MemberStatus.PENDING
      ? [`${QueryEvent.GET_APPLICANTS}-${community.id}`]
      : [`${QueryEvent.GET_DATABASE}-${community.id}`]
  );

  await createApplicationPayment(
    { memberTypeId, paymentMethodId, recurrence: type.recurrence },
    { communityId: community.id, memberId: member.id }
  );

  ctx.res.clearCookie('accessToken');
  ctx.res.clearCookie('refreshToken');

  return member;
};

export default applyToCommunity;