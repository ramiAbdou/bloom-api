/* eslint-disable sort-keys-fix/sort-keys-fix */
import day from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import createCommunity from '@entities/community/repo/createCommunity';
import createMembersFromCsv from '@entities/member/repo/createMembersFromCsv';
import Question, {
  QuestionCategory,
  QuestionType
} from '@entities/question/Question';
import RankedQuestion from '@entities/ranked-question/RankedQuestion';
import updateCommunity from '../src/entities/community/repo/updateCommunity';
import { RecurrenceType } from '../src/entities/member-type/MemberType';
import createMemberTypes, {
  CreateMemberTypeInput
} from '../src/entities/member-type/repo/createMemberTypes';
import populateRandomEvent from './populateRandomEvents';
import populateRandomMembers from './populateRandomMembers';

day.extend(utc);

const URL_NAME: string = 'onereq';

const oneReqQuestions: EntityData<Question>[] = [
  { category: QuestionCategory.FIRST_NAME, rank: 100 },
  { category: QuestionCategory.LAST_NAME, rank: 200 },
  { category: QuestionCategory.DUES_STATUS, rank: 300 },
  { category: QuestionCategory.EVENTS_ATTENDED, rank: 400 },
  { category: QuestionCategory.MEMBER_TYPE, rank: 500 },
  { category: QuestionCategory.EMAIL, rank: 600 },
  { category: QuestionCategory.GENDER, rank: 700 },
  { category: QuestionCategory.BIO, rank: 800 },
  { title: 'Company', type: QuestionType.SHORT_TEXT, rank: 900 },
  { title: 'Title/Role', type: QuestionType.SHORT_TEXT, rank: 1000 },
  {
    description:
      'Select the option that most closely describes your current role/focus area?',
    options: [
      'Recruiting Leadership',
      'Employer Branding',
      'Recruiting Operations & Programs',
      'University Recruiting',
      'Technical Recruiting',
      'Executive Recruiting',
      'Product Recruiting',
      'G&A Recruiting',
      'Recruiting Partner (University, Bootcamp)',
      'Recruiting Vendor',
      'Other'
    ],
    rank: 1100,
    title: 'Focus Area',
    type: QuestionType.MULTIPLE_CHOICE
  },
  {
    description: 'What other areas of recruiting are you interested in?',
    options: [
      'Recruiting Leadership',
      'Employer Branding',
      'Recruiting Operations & Programs',
      'University Recruiting',
      'Technical Recruiting',
      'Executive Recruiting',
      'Product Recruiting',
      'G&A Recruiting',
      'Recruiting Partner (University, Bootcamp)',
      'Recruiting Vendor',
      'Other'
    ],
    rank: 1200,
    title: 'Other Focus Area(s)',
    type: QuestionType.MULTIPLE_SELECT
  },
  {
    rank: 1300,
    title: 'What is your biggest challenge in Talent Acquisition?',
    type: QuestionType.LONG_TEXT
  },
  { category: QuestionCategory.JOINED_AT, rank: 1400 },
  { category: QuestionCategory.FACEBOOK_URL, rank: 1500 },
  {
    category: QuestionCategory.LINKED_IN_URL,
    description: 'Ex: www.linkedin.com/in/name',
    rank: 1600
  },
  { category: QuestionCategory.TWITTER_URL, rank: 1700 }
];

const oneReqRankedQuestionRank = {
  'First Name': 100,
  'Last Name': 200,
  Email: 300,
  Gender: 400,
  Company: 500,
  Title: 600,
  'LinkedIn URL': 700,
  'Focus Area': 800,
  'Other Focus Area(s)': 900,
  'What is your biggest challenge in Talent Acquisition?': 1000
};

const oneReqMemberTypes: CreateMemberTypeInput[] = [
  { amount: 5.0, name: 'Supporter', recurrence: RecurrenceType.MONTHLY },
  {
    amount: 10.0,
    name: 'Friend',
    recurrence: RecurrenceType.MONTHLY
  },
  { amount: 15.0, name: 'Family', recurrence: RecurrenceType.MONTHLY }
];

const createPaidCommunity = async (): Promise<void> => {
  const community = await createCommunity({
    application: {
      description: `Helping recruiters make an impact through talent acquisition is our “Req”. It’s evergreen. The mission is always the same. Let’s Build Together. OneReq at a time.`,
      title: `OneReq Member Application`
    },
    autoAccept: true,
    name: 'OneReq',
    primaryColor: '#8185A5',
    questions: oneReqQuestions,
    urlName: URL_NAME
  });

  const questions: Question[] = community.questions.getItems();

  const updatedCommunity: Community = await updateCommunity({
    communityId: community.id,
    highlightedQuestion: questions.find((question: Question) => {
      return question.title === 'Company';
    })?.id
  });

  await createMemberTypes(
    { defaultMemberTypeName: 'Supporter', memberTypes: oneReqMemberTypes },
    { communityId: updatedCommunity.id }
  );

  const bm: BloomManager = new BloomManager();

  questions.forEach((question: Question) => {
    if (!oneReqRankedQuestionRank[question.title]) return;

    bm.create(RankedQuestion, {
      application: community.application,
      question,
      rank: oneReqRankedQuestionRank[question.title]
    });
  });

  await bm.flush();

  await createMembersFromCsv({
    ownerEmail: process.env.USER_EMAIL,
    urlName: URL_NAME
  });

  await populateRandomMembers(URL_NAME);
  await populateRandomEvent(community);
};

export default createPaidCommunity;
