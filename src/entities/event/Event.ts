import { IsUrl } from 'class-validator';
import day from 'dayjs';
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
import BloomManager from '@core/db/BloomManager';
import Community from '../community/Community';
import EventAttendee from '../event-attendee/EventAttendee';
import EventGuest from '../event-guest/EventGuest';
import EventInvitee from '../event-invitee/EventInvitee';
import EventWatch from '../event-watch/EventWatch';

@ObjectType()
@Entity()
export default class Event extends BaseEntity {
  @Field()
  @Property({ type: 'text' })
  description: string;

  @Field()
  @Property()
  endTime: string;

  @Field(() => String)
  async eventUrl(): Promise<string> {
    const community: Community = await new BloomManager().findOne(Community, {
      id: this.community.id
    });

    return `${APP.CLIENT_URL}/${community.urlName}/events/${this.id}`;
  }

  @Field({ nullable: true })
  @Property({ nullable: true })
  googleCalendarEventId?: string;

  @Field(() => String, { nullable: true })
  async googleCalendarEventUrl(): Promise<string> {
    if (!this.googleCalendarEventId) return null;
    return `${this.googleCalendarEventId}`;
  }

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  imageUrl?: string;

  @Field()
  @Property({ default: true })
  private: boolean;

  @Field({ nullable: true })
  @Property({ nullable: true })
  @IsUrl()
  recordingUrl: string;

  @Field()
  @Property()
  startTime: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  summary: string;

  @Field()
  @Property()
  title: string;

  @Field()
  @Property()
  @IsUrl()
  videoUrl: string;

  // ## LIFECYCLE

  @BeforeCreate()
  beforeCreate() {
    this.endTime = day.utc(this.endTime).format();
    this.startTime = day.utc(this.startTime).format();
  }

  // ## RELATIONSHIPS

  @Field(() => [EventAttendee])
  @OneToMany(() => EventAttendee, ({ event }) => event)
  attendees = new Collection<EventAttendee>(this);

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;

  @Field(() => [EventGuest])
  @OneToMany(() => EventGuest, ({ event }) => event)
  guests = new Collection<EventGuest>(this);

  @Field(() => [EventInvitee])
  @OneToMany(() => EventInvitee, ({ event }) => event)
  invitees = new Collection<EventInvitee>(this);

  @Field(() => [EventWatch])
  @OneToMany(() => EventWatch, ({ event }) => event)
  watches = new Collection<EventWatch>(this);
}
