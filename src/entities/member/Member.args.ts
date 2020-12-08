import { ArgsType, Field, InputType, ObjectType } from 'type-graphql';

@InputType()
export class MemberDataInput {
  @Field()
  questionId: string;

  @Field(() => [String], { nullable: true })
  value: string[];
}

export type MemberRole = 'ADMIN' | 'OWNER';
export type MemberStatus = 'REJECTED' | 'PENDING' | 'INVITED' | 'ACCEPTED';

@ArgsType()
export class ApplyForMemberArgs {
  @Field(() => [MemberDataInput])
  data: MemberDataInput[];

  @Field()
  email: string;

  @Field()
  encodedUrlName: string;
}

@ArgsType()
export class RespondToMembersArgs {
  @Field(() => [String])
  memberIds: string[];

  @Field(() => String)
  response: MemberStatus;
}

@ArgsType()
export class DeleteMembersArgs {
  @Field(() => [String])
  memberIds: string[];
}

@ArgsType()
export class ToggleAdminArgs {
  @Field(() => [String])
  memberIds: string[];
}

@InputType()
export class NewMemberInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => Boolean)
  isAdmin: boolean;
}

@ArgsType()
export class CreateMembersArgs {
  @Field(() => [NewMemberInput])
  members: NewMemberInput[];
}

@ObjectType()
export class QuestionValue {
  @Field()
  questionId: string;

  @Field({ nullable: true })
  value: string;
}
