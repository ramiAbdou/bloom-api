import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import CommunityApplication from '@entities/community-application/CommunityApplication';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import Community from '@entities/community/Community';
import Question, { QuestionCategory } from '@entities/question/Question';
import { FlushEvent } from '@util/events';

/**
 * Creates a new community when Bloom has a new customer. Omits the addition
 * of a logo. For now, the community should send Bloom a square logo that
 * we will manually add to the Digital Ocean space.
 */
const createCommunity = async ({
  application,
  ...data
}: EntityData<Community>): Promise<Community> => {
  const bm = new BloomManager();

  // Add the first name, last name and joined at dates to array of questions.
  const allQuestions: EntityData<Question>[] = [
    {
      category: QuestionCategory.FIRST_NAME,
      locked: true,
      title: 'First Name'
    },
    { category: QuestionCategory.LAST_NAME, locked: true, title: 'Last Name' },
    { category: QuestionCategory.BIO, locked: true, title: 'Bio' },
    { category: QuestionCategory.DUES_STATUS, locked: true, title: 'Status' },
    {
      category: QuestionCategory.MEMBERSHIP_TYPE,
      locked: true,
      title: 'Membership Type'
    },
    { category: QuestionCategory.JOINED_AT, locked: true, title: 'Joined At' }
  ];

  const persistedQuestions: Question[] = allQuestions.map(
    (question: EntityData<Question>) => bm.create(Question, question)
  );

  const community: Community = bm.create(Community, {
    ...data,
    application: application
      ? bm.create(CommunityApplication, application)
      : null,
    integrations: bm.create(CommunityIntegrations, {}),
    questions: persistedQuestions
  });

  await bm.flush({ flushEvent: FlushEvent.CREATE_COMMUNITY });

  return community;
};

export default createCommunity;
