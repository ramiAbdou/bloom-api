import { ArgsType, Field, ObjectType } from 'type-graphql';

export enum MemberDuesStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}

export enum MemberRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

export enum MemberStatus {
  ACCEPTED = 'ACCEPTED',
  INVITED = 'INVITED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

@ArgsType()
export class AdminArgs {
  @Field(() => [String])
  memberIds: string[];
}

@ObjectType()
export class QuestionValue {
  @Field()
  questionId: string;

  @Field({ nullable: true })
  value: string;
}
