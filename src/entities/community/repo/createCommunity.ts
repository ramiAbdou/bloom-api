import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import CommunityApplication from '../../community-application/CommunityApplication';
import CommunityIntegrations from '../../community-integrations/CommunityIntegrations';
import MemberType from '../../member-type/MemberType';
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
  questions,
  types,
  ...data
}: EntityData<Community>): Promise<Community> => {
  const bm = new BloomManager();

  let defaultTypeId: string = null;

  const persistedTypes: MemberType[] = types.map(
    (type: EntityData<MemberType>) => {
      const persistedType: MemberType = bm.create(MemberType, type);
      if (type.isDefault) defaultTypeId = persistedType.id;
      return persistedType;
    }
  );

  const duesStatusQuestions: EntityData<Question>[] = persistedTypes.some(
    ({ amount }: MemberType) => !!amount
  )
    ? [{ category: QuestionCategory.DUES_STATUS, title: 'Status' }]
    : [];

  // Add the first name, last name and joined at dates to array of questions.
  const questionsWithDefaults: EntityData<Question>[] = [
    { category: QuestionCategory.FIRST_NAME, title: 'First Name' },
    { category: QuestionCategory.LAST_NAME, title: 'Last Name' },
    ...duesStatusQuestions,
    { category: QuestionCategory.MEMBERSHIP_TYPE, title: 'Membership Type' },
    ...questions,
    { category: 'JOINED_AT', title: 'Joined At' }
  ];

  const persistedQuestions = questionsWithDefaults.map((question, i: number) =>
    bm.create(Question, { ...question, order: i })
  );

  const community = bm.create(Community, {
    ...data,
    application: application
      ? bm.create(CommunityApplication, application)
      : null,
    defaultType: defaultTypeId,
    integrations: bm.create(CommunityIntegrations, {}),
    questions: persistedQuestions,
    types: persistedTypes
  });

  await bm.flush({ event: 'COMMUNITY_CREATED' });
  return community;
};

export default createCommunity;
