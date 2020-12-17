import BloomManager from '@core/db/BloomManager';
import CommunityApplication from '../../community-application/CommunityApplication';
import CommunityIntegrations from '../../community-integrations/CommunityIntegrations';
import MemberType from '../../member-type/MemberType';
import { MemberTypeInput } from '../../member-type/MemberType.types';
import Member from '../../member/Member';
import Question from '../../question/Question';
import { QuestionInput } from '../../question/Question.types';
import User from '../../user/User';
import Community from '../Community';

type CommunityOwnerArgs = Pick<User, 'email' | 'firstName' | 'lastName'>;

export class CreateCommunityArgs {
  applicationDescription?: string;

  applicationTitle?: string;

  autoAccept? = false;

  name: string;

  primaryColor?: string;

  questions: QuestionInput[];

  owner: CommunityOwnerArgs;

  types: MemberTypeInput[];
}

/**
 * Creates a new community when Bloom has a new customer. Omits the addition
 * of a logo. For now, the community should send Bloom a square logo that
 * we will manually add to the Digital Ocean space.
 */
export default async ({
  applicationDescription: description,
  applicationTitle: title,
  questions,
  owner,
  types,
  ...data
}: CreateCommunityArgs): Promise<Community> => {
  const bm = new BloomManager();

  const persistedTypes: MemberType[] = types.map(
    (type: Omit<MemberTypeInput, 'isDefault'>) => bm.create(MemberType, type)
  );

  const defaultType = persistedTypes.find(({ name }) => {
    return types.find((type) => type.name === name).isDefault;
  });

  const community = bm.create(Community, {
    ...data,
    application: title
      ? bm.create(CommunityApplication, { description, title })
      : null,
    defaultType: defaultType.id,
    integrations: bm.create(CommunityIntegrations, {}),
    members: [
      bm.create(Member, {
        role: 'OWNER',
        type: defaultType.id,
        user: bm.create(User, { ...owner })
      })
    ],
    questions: questions.map((question, i: number) =>
      bm.create(Question, { ...question, order: i })
    ),
    types: persistedTypes
  });

  await bm.flush('COMMUNITY_CREATED');
  return community;
};
