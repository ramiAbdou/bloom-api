import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import Application from '@entities/application/Application';
import CommunityIntegrations from '@entities/community-integrations/CommunityIntegrations';
import Community from '@entities/community/Community';
import Question, {
  QuestionCategory,
  QuestionType
} from '@entities/question/Question';
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
    {
      category: QuestionCategory.BIO,
      locked: true,
      title: 'Bio',
      type: QuestionType.LONG_TEXT
    },
    { category: QuestionCategory.DUES_STATUS, locked: true, title: 'Status' },
    {
      category: QuestionCategory.MEMBER_PLAN,
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
    application: application ? bm.create(Application, application) : null,
    integrations: bm.create(CommunityIntegrations, {}),
    questions: persistedQuestions
  });

  await bm.flush({ flushEvent: FlushEvent.CREATE_COMMUNITY });

  return community;
};

export default createCommunity;
