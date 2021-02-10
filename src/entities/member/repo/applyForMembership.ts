import { ArgsType, Field, InputType } from 'type-graphql';

import { GQLContext, QueryEvent } from '@constants';
import cache from '@core/cache/cache';
import BloomManager from '@core/db/BloomManager';
import Community from '../../community/Community';
import MemberData from '../../member-data/MemberData';
import createLifetimePayment from '../../member-payment/repo/createLifetimePayment';
import createSubscription from '../../member-payment/repo/createSubscription';
import MemberType from '../../member-type/MemberType';
import { RecurrenceType } from '../../member-type/MemberType.types';
import Question from '../../question/Question';
import { QuestionCategory } from '../../question/Question.types';
import User from '../../user/User';
import Member from '../Member';
import { MemberStatus } from '../Member.types';
import updatePaymentMethod from './updatePaymentMethod';

@InputType()
export class MemberDataInput {
  @Field(() => String, { nullable: true })
  category?: QuestionCategory;

  @Field({ nullable: true })
  questionId: string;

  @Field(() => [String], { nullable: true })
  value: string[];
}

@ArgsType()
export class ApplyForMembershipArgs {
  @Field(() => [MemberDataInput])
  data: MemberDataInput[];

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

    await createSubscription({ autoRenew: true, memberTypeId }, ctx);
  } catch (e) {
    await new BloomManager().findAndDelete(Member, { id: ctx.memberId });
    throw new Error(`There was a problem processing your payment.`);
  }
};

/**
 * Applies for member in the community using the given email and data.
 * A user is either created OR fetched based on the email.
 */
const applyForMembership = async (
  {
    data,
    email,
    memberTypeId,
    paymentMethodId,
    urlName
  }: ApplyForMembershipArgs,
  { res }: Pick<GQLContext, 'res'>
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

  const member: Member = bm.create(Member, { community, user });
  const questions = community.questions.getItems();

  // Some data we store on the user entity, and some we store as member
  // data.
  data.forEach(({ category, questionId, value: values }: MemberDataInput) => {
    // If there's no value, then short circuit. Because for the initial
    // creation of data, it must exist.
    if (!values?.length) return;

    const question: Question = questions.find(({ id }) => questionId === id);
    category = category ?? question.category;

    const value = (question?.type === 'MULTIPLE_SELECT'
      ? values
      : values[0]
    )?.toString();

    if (questionId) bm.create(MemberData, { member, question, value });

    if (category === 'EMAIL') user.email = value;
    else if (category === 'FIRST_NAME') user.firstName = value;
    else if (category === 'LAST_NAME') user.lastName = value;
    else if (category === 'GENDER') user.gender = value;
    else if (category === 'MEMBERSHIP_TYPE') member.type = type;
  });

  await bm.flush({ event: 'APPLY_FOR_MEMBERSHIP' });

  cache.invalidateEntries(
    member.status === MemberStatus.PENDING
      ? [`${QueryEvent.GET_APPLICANTS}-${community.id}`]
      : [`${QueryEvent.GET_DATABASE}-${community.id}`]
  );

  await createApplicationPayment(
    { memberTypeId, paymentMethodId, recurrence: type.recurrence },
    { communityId: community.id, memberId: member.id }
  );

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return member;
};

export default applyForMembership;
