import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class MailchimpLists {
  @Field()
  id: string;

  @Field()
  name: string;
}
