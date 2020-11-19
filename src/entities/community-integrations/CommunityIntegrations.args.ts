/**
 * @fileoverview Resolver Argument: GetCommunity
 * @author Rami Abdou
 */

import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class MailchimpLists {
  @Field()
  id: string;

  @Field()
  name: string;
}

@ObjectType()
export class ZoomAccountInfo {
  @Field()
  email: string;

  // Personal Meeting ID
  @Field()
  pmi: string;

  @Field()
  userId: string;
}
