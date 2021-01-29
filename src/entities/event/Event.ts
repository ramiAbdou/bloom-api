import { IsUrl } from 'class-validator';
import day from 'dayjs';
import { Authorized, Field, ObjectType } from 'type-graphql';
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
import { TimeSeriesData } from '@util/gql.types';
import Community from '../community/Community';
import EventAttendee from '../event-attendee/EventAttendee';
import EventGuest from '../event-guest/EventGuest';
import EventWatch from '../event-watch/EventWatch';
import getEventAttendeeSeries from './repo/getEventAttendeesSeries';
import getEventGuestSeries from './repo/getEventGuestsSeries';

@ObjectType()
@Entity()
export default class Event extends BaseEntity {
  @Field()
  @Property({ type: 'text' })
  description: string;

  @Field()
  @Property()
  endTime: string;

  @Field()
  @Property({ persist: false })
  get eventUrl(): string {
    return `${APP.CLIENT_URL}/${this.community.urlName}/events/${this.id}`;
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

  // ## REPO FUNCTIONS

  @Authorized('ADMIN')
  @Field(() => [TimeSeriesData])
  async attendeesSeries(): Promise<TimeSeriesData[]> {
    return getEventAttendeeSeries(this.id);
  }

  @Authorized('ADMIN')
  @Field(() => [TimeSeriesData])
  async guestsSeries(): Promise<TimeSeriesData[]> {
    return getEventGuestSeries(this.id);
  }

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

  @Field(() => [EventWatch])
  @OneToMany(() => EventWatch, ({ event }) => event)
  watches = new Collection<EventWatch>(this);
}
