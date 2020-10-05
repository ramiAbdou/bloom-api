/**
 * @fileoverview Resolver Argument: EventAttendee
 * @author Rami Abdou
 */

import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class JoinEventArgs {
  @Field()
  eventId: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  fullName: string;
}
