import { EntityData } from '@mikro-orm/core';

import { FlushEvent } from '@constants';
import BloomManager from '@core/db/BloomManager';
import CommunityApplication from '../../community-application/CommunityApplication';
import CommunityIntegrations from '../../community-integrations/CommunityIntegrations';
import MemberType from '../../member-type/MemberType';
import Question from '../../question/Question';
import { QuestionCategory } from '../../question/Question.types';
import Community from '../Community';

export interface CreateCommunityArgs extends EntityData<Community> {
  highlightedQuestionTitle?: string;
}

/**
 * Creates a new community when Bloom has a new customer. Omits the addition
 * of a logo. For now, the community should send Bloom a square logo that
 * we will manually add to the Digital Ocean space.
 */
const createCommunity = async ({
  application,
  highlightedQuestionTitle,
  questions,
  types,
  ...data
}: CreateCommunityArgs): Promise<Community> => {
  const bm = new BloomManager();

  let defaultTypeId: string = null;

  const persistedTypes: MemberType[] = types.map(
    (type: EntityData<MemberType>) => {
      const persistedType: MemberType = bm.create(MemberType, type);
      if (type.isDefault) defaultTypeId = persistedType.id;
      return persistedType;
    }
  );

  // Add the first name, last name and joined at dates to array of questions.
  const questionsWithDefaults: EntityData<Question>[] = [
    { category: QuestionCategory.FIRST_NAME, title: 'First Name' },
    { category: QuestionCategory.LAST_NAME, title: 'Last Name' },
    { category: QuestionCategory.DUES_STATUS, title: 'Status' },
    { category: QuestionCategory.MEMBERSHIP_TYPE, title: 'Membership Type' },
    ...questions,
    { category: QuestionCategory.JOINED_AT, title: 'Joined At' }
  ];

  let highlightedQuestionId: string = null;

  const persistedQuestions: Question[] = questionsWithDefaults.map(
    (question: EntityData<Question>, i: number) => {
      question.order = i;
      const persistedQuestion: Question = bm.create(Question, question);

      if (question.title === highlightedQuestionTitle) {
        highlightedQuestionId = persistedQuestion.id;
      }

      return persistedQuestion;
    }
  );

  const community: Community = bm.create(Community, {
    ...data,
    application: application
      ? bm.create(CommunityApplication, application)
      : null,
    defaultType: { id: defaultTypeId },
    highlightedQuestion: { id: highlightedQuestionId },
    integrations: bm.create(CommunityIntegrations, {}),
    questions: persistedQuestions,
    types: persistedTypes
  });

  await bm.flush(FlushEvent.CREATE_COMMUNITY);
  return community;
};

export default createCommunity;
