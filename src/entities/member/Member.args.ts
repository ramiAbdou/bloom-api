import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class QuestionValue {
  @Field()
  questionId: string;

  @Field({ nullable: true })
  value: string;
}
