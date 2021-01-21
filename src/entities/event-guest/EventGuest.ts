import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Event from '../event/Event';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class EventGuest extends BaseEntity {
  @Field(() => Event)
  @ManyToOne(() => Event)
  event: Event;

  @Field(() => Member)
  @ManyToOne(() => Member)
  member: Member;
}
