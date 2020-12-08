import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { Event, Member } from '@entities';

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

  @ManyToOne(() => Member, { nullable: true })
  member: Member;
}
