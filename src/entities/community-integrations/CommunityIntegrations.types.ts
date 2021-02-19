import { Field, ObjectType } from 'type-graphql';

export interface CommunityIntegrationsAuthArgs {
  code: string;
  urlName: string;
}

@ObjectType()
export class MailchimpLists {
  @Field()
  id: string;

  @Field()
  name: string;
}
