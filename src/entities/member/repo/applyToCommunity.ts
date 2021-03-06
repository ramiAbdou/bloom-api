import { ArgsType, Field, InputType } from 'type-graphql';
import { FilterQuery } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import MemberIntegrations from '@entities/member-integrations/MemberIntegrations';
import updateStripePaymentMethodId from '@entities/member-integrations/repo/updateStripePaymentMethodId';
import MemberSocials from '@entities/member-socials/MemberSocials';
import MemberType, { RecurrenceType } from '@entities/member-type/MemberType';
import MemberValue from '@entities/member-value/MemberValue';
import Question, {
  QuestionCategory,
  QuestionType
} from '@entities/question/Question';
import User from '@entities/user/User';
import { ApplyToCommunityAdminsPayload } from '@system/emails/repo/getApplyToCommunityAdminsVars';
import { ApplyToCommunityPayload } from '@system/emails/repo/getApplyToCommunityVars';
import emitEmailEvent from '@system/events/repo/emitEmailEvent';
import { GQLContext } from '@util/constants';
import { EmailEvent } from '@util/constants.events';
import updateStripeSubscriptionId from '../../member-integrations/repo/updateStripeSubscriptionId';
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
 * method ID is provided, nothing happens. Creates a subscription.
 *
 * @param args.memberTypeId Type ID to apply for.
 * @param args.paymentMethodId ID of the Stripe Payment Method.
 * @param args.recurrence Recurrence of the new type to apply to.
 * @param ctx.communityId ID of the community.
 * @param ctx.memberId ID of the member.
 */
const createApplicationPayment = async (
  args: CreateApplicationPaymentArgs,
  ctx: Pick<GQLContext, 'communityId' | 'memberId'>
): Promise<Member> => {
  const { memberTypeId, paymentMethodId } = args;

  if (!paymentMethodId) return;

  try {
    await updateStripePaymentMethodId({ paymentMethodId }, ctx);
    await updateStripeSubscriptionId({ memberTypeId }, ctx);
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
  const { data, email, memberTypeId, paymentMethodId, urlName } = args;

  const bm: BloomManager = new BloomManager();

  const queryArgs: FilterQuery<MemberType> = memberTypeId || {
    community: { urlName }
  };

  // Populate the questions and types so that we can capture the member
  // data in a relational manner.
  const [community, memberType]: [Community, MemberType] = await Promise.all([
    bm.findOne(Community, { urlName }, { populate: ['questions'] }),
    bm.findOne(MemberType, queryArgs)
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
    } else if (category === QuestionCategory.TWITTER_URL) {
      socials.twitterUrl = value;
    } else if (category === QuestionCategory.MEMBER_TYPE) {
      member.memberType = memberType;
    } else bm.create(MemberValue, { member, question, value });
  });

  await bm.flush();

  emitEmailEvent(EmailEvent.APPLY_TO_COMMUNITY, {
    communityId: community.id,
    memberId: member.id
  } as ApplyToCommunityPayload);

  emitEmailEvent(EmailEvent.APPLY_TO_COMMUNITY_ADMINS, {
    applicantId: member.id,
    communityId: community.id
  } as ApplyToCommunityAdminsPayload);

  await createApplicationPayment(
    { memberTypeId, paymentMethodId, recurrence: memberType.recurrence },
    { communityId: community.id, memberId: member.id }
  );

  ctx.res.clearCookie('accessToken');
  ctx.res.clearCookie('refreshToken');

  return member;
};

export default applyToCommunity;
