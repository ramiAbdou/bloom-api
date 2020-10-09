/**
 * @fileoverview Entity: EventAttendee
 * @author Rami Abdou
 */

import { Entity, EntityRepositoryType, ManyToOne, Property } from 'mikro-orm';

import { Event, Membership } from '@entities';
import BaseEntity from '@util/db/BaseEntity';
import EventAttendeeRepo from './EventAttendeeRepo';

@Entity({ customRepository: () => EventAttendeeRepo })
export default class EventAttendee extends BaseEntity {
  [EntityRepositoryType]?: EventAttendeeRepo;

  @Property({ nullable: true })
  fullName: string;

  @Property({ nullable: true })
  email: string;

  @ManyToOne(() => Event)
  event: Event;

  @ManyToOne(() => Membership, { nullable: true })
  membership: Membership;
}
