import { Field, ObjectType } from 'type-graphql';
import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
  Unique
} from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import Community from '@entities/community/Community';
import EventAttendee from '@entities/event-attendee/EventAttendee';
import EventGuest from '@entities/event-guest/EventGuest';
import User from '@entities/user/User';

@ObjectType()
@Entity()
@Unique({ properties: ['community', 'email'] })
export default class Supporter extends BaseEntity {
  static cache = new Cache();

  // ## FIELDS

  @Field()
  @Property()
  email: string;

  @Field()
  @Property()
  firstName: string;

  @Field()
  @Property({ persist: false })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Field()
  @Property()
  lastName: string;

  // ## RELATIONSHIPS

  @Field(() => [EventAttendee])
  @OneToMany(() => EventAttendee, ({ supporter }) => supporter)
  attendees = new Collection<EventAttendee>(this);

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;

  @Field(() => [EventGuest])
  @OneToMany(() => EventGuest, ({ supporter }) => supporter)
  guests = new Collection<EventGuest>(this);

  @Field(() => User)
  @ManyToOne(() => User)
  user: User;
}
