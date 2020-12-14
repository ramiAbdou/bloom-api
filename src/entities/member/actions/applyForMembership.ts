import { ArgsType, Field, InputType } from 'type-graphql';

import { Event } from '@constants';
import cache from '@core/cache';
import BloomManager from '@core/db/BloomManager';
import User from '../../user/User';
import Member from '../Member';

@InputType()
export class MemberDataInput {
  @Field()
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

  @Field()
  encodedUrlName: string;
}

/**
 * Applies for member in the community using the given email and data.
 * A user is either created OR fetched based on the email.
 */
export default async ({
  data,
  email,
  encodedUrlName
}: ApplyForMembershipArgs): Promise<Member> => {
  const bm = new BloomManager();
  const communityRepo = bm.communityRepo();
  const memberRepo = bm.memberRepo();
  const memberDataRepo = bm.memberDataRepo();
  const userRepo = bm.userRepo();

  // Populate the questions and types so that we can capture the member
  // data in a relational manner.
  const community = await communityRepo.findOne({ encodedUrlName }, [
    'integrations',
    'questions',
    'types'
  ]);

  // The user can potentially already exist if they are a part of other
  // communities.
  const user: User =
    (await userRepo.findOne({ email })) ?? userRepo.createAndPersist({ email });

  if (await memberRepo.findOne({ community, user })) {
    throw new Error(
      `This email is already registered in the ${community.name} community.`
    );
  }

  const member: Member = memberRepo.createAndPersist({ community, user });
  const questions = community.questions.getItems();
  const types = community.types.getItems();

  // Some data we store on the user entity, and some we store as member
  // data.
  data.forEach(({ questionId, value: valueArray }) => {
    // If there's no value, then short circuit. Because for the initial
    // creation of data, it must exist.
    if (!valueArray || !valueArray.length) return;

    const question = questions.find(({ id }) => questionId === id);
    const { category } = question;

    const value =
      question.type === 'MULTIPLE_SELECT' ? valueArray : valueArray[0];

    if (category === 'EMAIL') user.email = value as string;
    else if (category === 'FIRST_NAME') user.firstName = value as string;
    else if (category === 'LAST_NAME') user.lastName = value as string;
    else if (category === 'GENDER') user.gender = value as string;
    else if (category === 'MEMBERSHIP_TYPE') {
      const type = types.find(({ name }) => value === name);
      if (type) member.type = type;
    } else {
      memberDataRepo.createAndPersist({ member, question, value });
    }
  });

  await memberRepo.persistAndFlush(member, 'MEMBERSHIP_CREATED');

  // Invalidate the cache for the GET_APPLICANTS call.
  cache.invalidateEntries(
    [
      `${Event.GET_APPLICANTS}-${community.id}`,
      `${Event.GET_MEMBERS}-${community.id}`
    ],
    true
  );

  // Send the appropriate emails based on the response.
  setTimeout(async () => {
    if (community.autoAccept) {
      await memberRepo.sendMemberAcceptedEmails([member], community);
    } else await memberRepo.sendMemberReceievedEmail(member, community);
  }, 0);

  return member;
};
