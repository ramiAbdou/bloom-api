import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { Event, Member } from '@entities/entities';

@Entity()
export default class EventAttendee extends BaseEntity {
  @Property({ nullable: true })
  fullName: string;

  @Property({ nullable: true })
  email: string;

  // ## RELATIONSHIPS

  @ManyToOne(() => Event)
  event: Event;

  @ManyToOne(() => Member, { nullable: true })
  member: Member;
}
