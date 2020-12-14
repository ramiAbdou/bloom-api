import { Field, ObjectType } from 'type-graphql';

export type MemberRole = 'ADMIN' | 'OWNER';
export type MemberStatus = 'REJECTED' | 'PENDING' | 'INVITED' | 'ACCEPTED';

@ObjectType()
export class QuestionValue {
  @Field()
  questionId: string;

  @Field({ nullable: true })
  value: string;
}
