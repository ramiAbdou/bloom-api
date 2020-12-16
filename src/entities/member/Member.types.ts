import { ArgsType, Field, ObjectType } from 'type-graphql';

export enum MemberRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

export type MemberStatus = 'REJECTED' | 'PENDING' | 'INVITED' | 'ACCEPTED';

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
