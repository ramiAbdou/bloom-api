import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne, Unique } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Event from '../event/Event';
import Member from '../member/Member';

@ObjectType()
@Entity()
@Unique({ properties: ['event', 'member'] })
export default class EventWatch extends BaseEntity {
  // ## RELATIONSHIPS

  @Field(() => Event)
  @ManyToOne(() => Event)
  event: Event;

  @Field(() => Member)
  @ManyToOne(() => Member)
  member: Member;
}
