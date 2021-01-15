import { ArgsType, Field, InputType } from 'type-graphql';

import { QueryEvent } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import Community from '../../community/Community';
import MemberData from '../../member-data/MemberData';
import createSubscription from '../../member-payment/repo/createSubscription';
import { QuestionCategory } from '../../question/Question.types';
import User from '../../user/User';
import Member from '../Member';
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

/**
 * Applies for member in the community using the given email and data.
 * A user is either created OR fetched based on the email.
 */
const applyForMembership = async ({
  data,
  email,
  memberTypeId,
  paymentMethodId,
  urlName
}: ApplyForMembershipArgs): Promise<Member> => {
  const bm = new BloomManager();

  // Populate the questions and types so that we can capture the member
  // data in a relational manner.
  const community = await bm.findOne(
    Community,
    { urlName },
    { populate: ['integrations', 'questions', 'types'] }
  );

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
  const types = community.types.getItems();

  // Some data we store on the user entity, and some we store as member
  // data.
  data.forEach(({ category, questionId, value: valueArray }) => {
    // If there's no value, then short circuit. Because for the initial
    // creation of data, it must exist.
    if (!valueArray?.length) return;

    const question = questions.find(({ id }) => questionId === id);
    category = category ?? question.category;

    const value =
      question?.type === 'MULTIPLE_SELECT' ? valueArray : valueArray[0];

    if (category === 'EMAIL') user.email = value as string;
    else if (category === 'FIRST_NAME') user.firstName = value as string;
    else if (category === 'LAST_NAME') user.lastName = value as string;
    else if (category === 'GENDER') user.gender = value as string;
    else if (category === 'MEMBERSHIP_TYPE') {
      const type = types.find(({ name }) => value === name);
      if (type) member.type = type;
    } else {
      bm.create(MemberData, { member, question, value: value.toString() });
    }
  });

  await bm.flush('MEMBERS_CREATED');

  // Invalidate the cache for the GET_APPLICANTS call.
  cache.invalidateEntries([
    `${QueryEvent.GET_APPLICANTS}-${community.id}`,
    `${QueryEvent.GET_MEMBERS}-${community.id}`
  ]);

  await updatePaymentMethod(
    { paymentMethodId },
    { communityId: community.id, memberId: member.id }
  );

  await createSubscription(
    { autoRenew: true, memberTypeId },
    { communityId: community.id, memberId: member.id }
  );

  // Send the appropriate emails based on the response.
  setTimeout(async () => {
    // if (community.autoAccept) {
    //   await bm.memberRepo().sendMemberAcceptedEmails([member], community);
    // } else await bm.memberRepo().sendMemberReceievedEmail(member, community);
  }, 0);

  return member;
};

export default applyForMembership;
