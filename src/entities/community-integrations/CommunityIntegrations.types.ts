import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class MailchimpList {
  @Field()
  id: string;

  @Field()
  name: string;
}
