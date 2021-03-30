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
import updateCommunity from '../src/entities/community/repo/updateCommunity';
import createMemberPlans, {
  CreateMemberPlanInput
} from '../src/entities/member-plan/repo/createMemberPlans';
import RankedQuestion from '../src/entities/ranked-question/RankedQuestion';
import populateRandomEvents from './populateRandomEvents';
import populateRandomMembers from './populateRandomMembers';

day.extend(utc);

const URL_NAME = 'colorstack';

const freeCommunityQuestions: EntityData<Question>[] = [
  { category: QuestionCategory.FIRST_NAME, rank: 100 },
  { category: QuestionCategory.LAST_NAME, rank: 200 },
  { category: QuestionCategory.DUES_STATUS, rank: 300 },
  { category: QuestionCategory.EVENTS_ATTENDED, rank: 350 },
  { category: QuestionCategory.MEMBER_PLAN, rank: 400 },
  {
    category: QuestionCategory.EMAIL,
    description: `We'd prefer if you use your school email, but if you check another email more frequently, please provide that email. Make sure to check for typos.`,
    rank: 500
  },
  { category: QuestionCategory.GENDER, rank: 550 },
  { category: QuestionCategory.BIO, rank: 600 },
  {
    description: `Please use the full name of your university. For example,
    "Cornell University", not "Cornell."`,
    rank: 700,
    title: 'School',
    type: QuestionType.SHORT_TEXT
  },
  {
    description: `Please choose the option closest to your major. If your minor is more relevant to this community, please select that instead.`,
    options: [
      'Computer Science',
      'Information Science',
      'Electrical/Computer Engineering'
    ],
    rank: 800,
    title: 'Major',
    type: QuestionType.MULTIPLE_CHOICE
  },
  {
    options: ['Undergraduate', 'Masters', 'PhD'],
    rank: 900,
    title: 'Education Level',
    type: QuestionType.MULTIPLE_CHOICE
  },
  {
    options: ['2020', '2021', '2022', '2023', '2024', '2025'],
    rank: 1000,
    title: 'Expected Graduation Year',
    type: QuestionType.MULTIPLE_CHOICE
  },
  {
    description: `Our community is designed to support racially underrepresented students in tech.`,
    options: [
      'Black/African-American',
      'Hispanic/Latinx (Non-White)',
      'Native American/Alaska Native'
    ],
    rank: 1100,
    title: 'Race & Ethnicity',
    type: QuestionType.MULTIPLE_SELECT
  },
  {
    options: ['NSBE', 'SHPE', 'CODE2040', 'MLT', 'None of the Above'],
    rank: 1200,
    title: 'Are you an active member of any of these organizations?',
    type: QuestionType.MULTIPLE_SELECT
  },
  {
    adminOnly: true,
    description: `As a member, you'll be able to take advantage of the opportunities and services we offer, but we are exclusively interested in welcoming students that will make the community stronger.`,
    rank: 1300,
    required: false,
    title: `How do you plan to contribute to the community?`,
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

const freeCommunityRankedQuestionRank = {
  'First Name': 100,
  'Last Name': 200,
  Email: 300,
  Gender: 400,
  School: 500,
  Major: 600,
  'Education Level': 700,
  'Expected Graduation Year': 800,
  'Race & Ethnicity': 900,
  'Are you an active member of any of these organizations?': 1000,
  'How do you plan to contribute to the community?': 1100
};

const freeCommunityPlans: CreateMemberPlanInput[] = [
  { name: 'General Member' }
];

const createFreeCommunity = async () => {
  const community: Community = await createCommunity({
    application: {
      description: `Our mission is to increase the entrance, retention, and success of Black, Latinx, and Native American college students in computing. The stronger our community, the better positioned we are to move the needle for racial diversity in tech. Thank you for joining us.`,
      title: `ColorStack Student Application`
    },
    defaultTypeName: 'General Member',
    name: 'ColorStack',
    primaryColor: '#2B736D',
    questions: freeCommunityQuestions,
    urlName: URL_NAME
  });

  const questions: Question[] = community.questions.getItems();

  const updatedCommunity: Community = await updateCommunity({
    communityId: community.id,
    highlightedQuestion: questions.find((question: Question) => {
      return question.title === 'School';
    })?.id
  });

  await createMemberPlans(
    { defaultPlanName: 'General Member', plans: freeCommunityPlans },
    { communityId: updatedCommunity.id }
  );

  const bm: BloomManager = new BloomManager();

  questions.forEach((question: Question) => {
    if (!freeCommunityRankedQuestionRank[question.title]) return;

    bm.create(RankedQuestion, {
      application: updatedCommunity.application,
      question,
      rank: freeCommunityRankedQuestionRank[question.title]
    });
  });

  await bm.flush();

  await createMembersFromCsv({
    ownerEmail: process.env.USER_EMAIL,
    urlName: URL_NAME
  });

  await populateRandomMembers(URL_NAME);
  await populateRandomEvents(community);
};

export default createFreeCommunity;
