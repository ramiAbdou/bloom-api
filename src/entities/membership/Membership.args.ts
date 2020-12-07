import { ArgsType, Field, InputType, ObjectType } from 'type-graphql';

@InputType()
export class MembershipDataInput {
  @Field()
  questionId: string;

  @Field(() => [String], { nullable: true })
  value: string[];
}

export type MembershipRole = 'ADMIN' | 'OWNER';
export type MembershipStatus = 'REJECTED' | 'PENDING' | 'INVITED' | 'ACCEPTED';

@ArgsType()
export class ApplyForMembershipArgs {
  @Field(() => [MembershipDataInput])
  data: MembershipDataInput[];

  @Field()
  email: string;

  @Field()
  encodedUrlName: string;
}

@ArgsType()
export class RespondToMembershipsArgs {
  @Field(() => [String])
  membershipIds: string[];

  @Field(() => String)
  response: MembershipStatus;
}

@ArgsType()
export class DeleteMembershipsArgs {
  @Field(() => [String])
  membershipIds: string[];
}

@ArgsType()
export class ToggleAdminArgs {
  @Field(() => [String])
  membershipIds: string[];
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
export class CreateMembershipsArgs {
  @Field(() => [NewMemberInput])
  members: NewMemberInput[];
}

@ObjectType()
export class MemberData {
  @Field()
  questionId: string;

  @Field({ nullable: true })
  value: string;
}
