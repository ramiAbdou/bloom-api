import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property
} from '@mikro-orm/core';

import { APP } from '@constants';
import BaseEntity from '@core/db/BaseEntity';
import Community from '../community/Community';
import EventGuest from '../event-guest/EventGuest';

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

  @Field()
  @Property()
  startTime: string;

  @Field()
  @Property()
  title: string;

  @Field()
  @Property()
  @IsUrl()
  videoUrl: string;

  // ## RELATIONSHIPS

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;

  @Field(() => [EventGuest])
  @OneToMany(() => EventGuest, ({ event }) => event)
  guests = new Collection<EventGuest>(this);
}
