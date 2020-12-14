import BloomManager from '@core/db/BloomManager';
import { Member, Question, User } from '@entities/entities';
import CommunityApplication from '../../community-application/CommunityApplication';
import CommunityIntegrations from '../../community-integrations/CommunityIntegrations';
import MemberType from '../../member-type/MemberType';
import { MemberTypeInput } from '../../member-type/MemberType.types';
import { QuestionInput } from '../../question/Question.types';
import Community from '../Community';

type CommunityOwnerArgs = {
  email: string;
  firstName: string;
  lastName: string;
};

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

  const community = bm.create(Community, {
    ...data,
    application: title
      ? bm.create(CommunityApplication, { description, title })
      : null,
    integrations: bm.create(CommunityIntegrations, {}),
    members: [
      bm.create(Member, { role: 'OWNER', user: bm.create(User, { ...owner }) })
    ],
    questions: questions.map((question, i: number) =>
      bm.create(Question, { ...question, order: i })
    ),
    types: types.map((type: MemberTypeInput) => bm.create(MemberType, type))
  });

  await bm.flush('COMMUNITY_CREATED');
  return community;
};
