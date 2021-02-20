import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import { FlushEvent } from '@util/events';
import CommunityApplication from '../../community-application/CommunityApplication';
import CommunityIntegrations from '../../community-integrations/CommunityIntegrations';
import Question from '../../question/Question';
import { QuestionCategory } from '../../question/Question.types';
import Community from '../Community';

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
    { category: QuestionCategory.FIRST_NAME, title: 'First Name' },
    { category: QuestionCategory.LAST_NAME, title: 'Last Name' },
    { category: QuestionCategory.DUES_STATUS, title: 'Status' },
    { category: QuestionCategory.MEMBERSHIP_TYPE, title: 'Membership Type' },
    { category: QuestionCategory.JOINED_AT, title: 'Joined At' }
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
