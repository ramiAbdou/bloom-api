import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne, PrimaryKeyType } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Event from '../event/Event';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class EventInvitee extends BaseEntity {
  // ## RELATIONSHIPS

  @Field(() => Event)
  @ManyToOne(() => Event, { primary: true })
  event: Event;

  @Field(() => Member)
  @ManyToOne(() => Member, { primary: true })
  member: Member;

  [PrimaryKeyType]: [string, string];
}