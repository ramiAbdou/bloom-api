import { EntityData } from '@mikro-orm/core';

import BloomManager from '@core/db/BloomManager';
import CommunityApplication from '../../community-application/CommunityApplication';
import CommunityIntegrations from '../../community-integrations/CommunityIntegrations';
import MemberType from '../../member-type/MemberType';
import Question from '../../question/Question';
import Community from '../Community';

/**
 * Creates a new community when Bloom has a new customer. Omits the addition
 * of a logo. For now, the community should send Bloom a square logo that
 * we will manually add to the Digital Ocean space.
 */
export default async ({
  application,
  questions,
  types,
  ...data
}: EntityData<Community>): Promise<Community> => {
  const bm = new BloomManager();

  const persistedTypes: MemberType[] = types.map((type) =>
    bm.create(MemberType, type)
  );

  const defaultType = persistedTypes.find(({ name }) => {
    return types.find((type) => type.name === name).isDefault;
  });

  const community = bm.create(Community, {
    ...data,
    application: application
      ? bm.create(CommunityApplication, application)
      : null,
    defaultType: defaultType.id,
    integrations: bm.create(CommunityIntegrations, {}),
    questions: questions.map((question, i: number) =>
      bm.create(Question, { ...question, order: i })
    ),
    types: persistedTypes
  });

  await bm.flush('COMMUNITY_CREATED');
  return community;
};

// bm.create(Member, {
//   role: 'OWNER',
//   type: defaultType.id,
//   user: bm.create(User, { ...owner })
// })
