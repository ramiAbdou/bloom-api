import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne } from '@mikro-orm/core';

import BaseCompositeEntity from '@core/db/BaseCompositeEntity';
import Event from '../event/Event';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class EventAttendee extends BaseCompositeEntity {
  @Field(() => Event)
  @ManyToOne(() => Event, { primary: true })
  event: Event;

  @Field(() => Member)
  @ManyToOne(() => Member, { primary: true })
  member: Member;
}
