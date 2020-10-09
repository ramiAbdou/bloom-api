/**
 * @fileoverview Entity: EventRSVP
 * @author Rami Abdou
 */

import { Entity, EntityRepositoryType, ManyToOne, Property } from 'mikro-orm';

import { Event, Membership } from '@entities/entities';
import BaseEntity from '@util/db/BaseEntity';
import EventRSVPRepo from './EventRSVPRepo';

@Entity({ customRepository: () => EventRSVPRepo })
export default class EventRSVP extends BaseEntity {
  [EntityRepositoryType]?: EventRSVPRepo;

  @Property({ nullable: true })
  fullName: string;

  @Property({ nullable: true })
  email: string;

  @ManyToOne(() => Event)
  event: Event;

  @ManyToOne(() => Membership, { nullable: true })
  membership: Membership;
}
