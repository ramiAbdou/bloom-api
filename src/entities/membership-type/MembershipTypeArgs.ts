/**
 * @fileoverview Entity: MembershipType
 * @author Rami Abdou
 */

import { Field, Float, InputType } from 'type-graphql';

import MembershipType, { MembershipTypeRecurrence } from './MembershipType';

@InputType()
export class MembershipTypeInput implements Partial<MembershipType> {
  @Field(() => Float, { nullable: true })
  amount = 0.0;

  @Field(() => Boolean, { nullable: true })
  isDefault: boolean;

  @Field(() => String, { nullable: true })
  recurrence: MembershipTypeRecurrence;

  @Field()
  name: string;
}
