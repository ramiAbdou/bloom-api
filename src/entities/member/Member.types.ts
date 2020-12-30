import { ArgsType, Field, ObjectType } from 'type-graphql';

export enum MemberDuesStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LAME = 'LAME'
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

@ObjectType()
export class TimeSeriesData {
  @Field({ nullable: true })
  name: string;

  @Field()
  value: number;
}
