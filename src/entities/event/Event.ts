import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import {
  BeforeCreate,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property
} from '@mikro-orm/core';

import { APP } from '@constants';
import BaseEntity from '@core/db/BaseEntity';
import URLBuilder from '@core/URLBuilder';
import Community from '../community/Community';
import EventAttendee from '../event-attendee/EventAttendee';
import EventRSVP from '../event-rsvp/EventRSVP';
import MembershipQuestion from '../membership-question/MembershipQuestion';

@ObjectType()
@Entity()
export default class Event extends BaseEntity {
  /**
   * @example
   * """ If you're interested in pursuing a Software Engineering Internship,
   * RSVP on Jumpstart for our event with them next week! You’ll get a chance to
   * meet their team, ask questions about the application process, and more...
   * """
   */
  @Field()
  @Property({ type: 'text' })
  description: string;

  @Field()
  @Property()
  endTime: string;

  // A 2 x 1 dimension image representing the "flyer" of the event.
  @Field({ nullable: true })
  @Property({ nullable: true, unique: true })
  @IsUrl()
  image: string;

  /**
   * @example 10000
   * @example 10001
   * @example 10002
   * @example 10003
   * @example 10004
   */
  @Field()
  @Property({ type: Number })
  shortId: number;

  @Field()
  @Property()
  startTime: string;

  /**
   * @example ColorStack x Facebook: Day in the Life of a Software Engineer
   */
  @Field()
  @Property()
  title: string;

  // URL for participants to join the meeting.
  @Field()
  @Property()
  @IsUrl()
  zoomJoinUrl: string;

  @Property({ persist: false })
  get joinUrl(): string {
    return new URLBuilder(
      `${APP.CLIENT_URL}/${this.community.name}/events/${this.shortId}`
    ).addParam('join', true).url;
  }

  @BeforeCreate()
  beforeCreate() {
    this.shortId = this.community.events.length + 10000;
  }

  @Property({ persist: false })
  get questions(): MembershipQuestion[] {
    return this.community.questions
      .getItems()
      .filter(({ inApplication }) => inApplication);
  }

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @OneToMany(() => EventAttendee, ({ event }) => event)
  attendees: Collection<EventAttendee> = new Collection<EventAttendee>(this);

  @ManyToOne(() => Community)
  community: Community;

  @OneToMany(() => EventRSVP, ({ event }) => event)
  rsvps: Collection<EventRSVP> = new Collection<EventRSVP>(this);
}
