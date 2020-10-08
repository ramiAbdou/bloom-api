/**
 * @fileoverview Entity: EventAttendee
 * @author Rami Abdou
 */

import { Entity, ManyToOne, Property } from 'mikro-orm';

import { Event, Membership } from '@entities/entities';
import BaseEntity from '@util/db/BaseEntity';

@Entity()
export default class EventAttendee extends BaseEntity {
  @Property({ nullable: true })
  fullName: string;

  @Property({ nullable: true })
  email: string;

  @ManyToOne(() => Event)
  event: Event;

  @ManyToOne(() => Membership, { nullable: true })
  membership: Membership;
}
