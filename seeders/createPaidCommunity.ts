/* eslint-disable sort-keys-fix/sort-keys-fix */
import day from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Community from '@entities/community/Community';
import createCommunity from '@entities/community/repo/createCommunity';
import importCsvData from '@entities/community/repo/importCsvData';
import Question, {
  QuestionCategory,
  QuestionType
} from '@entities/question/Question';
import RankedQuestion from '@entities/ranked-question/RankedQuestion';
import { RecurrenceType } from '../src/entities/member-plan/MemberPlan';
import createMemberPlans, {
  CreateMemberPlanInput
} from '../src/entities/member-plan/repo/createMemberPlans';
import createQuestions from '../src/entities/question/repo/createQuestions';
import populateRandomEvent from './populateRandomEvents';
import populateRandomMembers from './populateRandomMembers';

day.extend(utc);

const URL_NAME = 'onereq';

const paidCommunity: EntityData<Community> = {
  application: {
    description: `Helping recruiters make an impact through talent acquisition is our “Req”. It’s evergreen. The mission is always the same. Let’s Build Together. OneReq at a time.`,
    title: `OneReq Member Application`
  },
  autoAccept: true,
  name: 'OneReq',
  primaryColor: '#8185A5',
  urlName: URL_NAME
};

const oneReqQuestions: EntityData<Question>[] = [
  { category: QuestionCategory.FIRST_NAME, rank: 100 },
  { category: QuestionCategory.LAST_NAME, rank: 200 },
  { category: QuestionCategory.DUES_STATUS, rank: 300 },
  { category: QuestionCategory.EVENTS_ATTENDED, rank: 400 },
  { category: QuestionCategory.MEMBER_PLAN, rank: 500 },
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

const oneReqPlans: CreateMemberPlanInput[] = [
  { amount: 5.0, name: 'Supporter', recurrence: RecurrenceType.MONTHLY },
  {
    amount: 10.0,
    name: 'Friend',
    recurrence: RecurrenceType.MONTHLY
  },
  { amount: 15.0, name: 'Family', recurrence: RecurrenceType.MONTHLY }
];

const createPaidCommunity = async () => {
  const community = await createCommunity(paidCommunity);

  await createMemberPlans(
    { defaultPlanName: 'Supporter', plans: oneReqPlans },
    { communityId: community.id }
  );

  const questions: Question[] = await createQuestions(
    { highlightedQuestionTitle: 'Company', questions: oneReqQuestions },
    { communityId: community.id }
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

  await importCsvData({
    ownerEmail: process.env.USER_EMAIL,
    urlName: URL_NAME
  });

  await populateRandomMembers(URL_NAME);
  await populateRandomEvent(community);
};

export default createPaidCommunity;
