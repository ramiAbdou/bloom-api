/**
 * @fileoverview Entity: EventRSVP
 * @author Rami Abdou
 */

import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { Event, Membership } from '@entities';
import BaseEntity from '@util/db/BaseEntity';

@Entity()
export default class EventRSVP extends BaseEntity {
  @Property({ nullable: true })
  fullName: string;

  @Property({ nullable: true })
  email: string;

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @ManyToOne(() => Event)
  event: Event;

  @ManyToOne(() => Membership, { nullable: true })
  membership: Membership;
}
