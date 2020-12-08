import { ArgsType, Field } from 'type-graphql';

import { MemberTypeInput } from '../member-type/MemberType.args';
import { QuestionInput } from '../question/Question.args';

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

@ArgsType()
export class GetCommunityArgs {
  @Field({ nullable: true })
  encodedUrlName: string;
}

@ArgsType()
export class ImportCommunityCSVArgs {
  @Field()
  encodedUrlName: string;
}
