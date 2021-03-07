import { Field, ObjectType } from 'type-graphql';
import { AfterCreate, Entity, ManyToOne, Unique, wrap } from '@mikro-orm/core';

import Cache from '@core/cache/cache';
import BaseEntity from '@core/db/BaseEntity';
import Supporter from '@entities/supporter/Supporter';
import { QueryEvent } from '@util/events';
import Event from '../event/Event';
import Member from '../member/Member';

@ObjectType()
@Entity()
@Unique({ properties: ['event', 'member', 'supporter'] })
export default class EventAttendee extends BaseEntity {
  static cache = new Cache();

  // ## METHODS

  async getCacheIdenitifers(): Promise<string[]> {
    await wrap(this.event).init();

    return [
      this.event.id,
      this.member?.id,
      this.supporter?.id,
      this.event.community.id
    ];
  }

  // ## LIFECYCLE HOOKS

  @AfterCreate()
  async afterCreate() {
    const cacheIds: string[] = await this.getCacheIdenitifers();

    const cacheKeys = cacheIds.map((cacheId: string) => {
      return `${QueryEvent.GET_EVENT_ATTENDEES}-${cacheId}`;
    });

    EventAttendee.cache.invalidateKeys([
      ...cacheKeys,
      `${QueryEvent.GET_EVENT_ATTENDEES_SERIES}-${this.event.community.id}`
    ]);
  }

  // ## RELATIONSHIPS

  @Field(() => Event)
  @ManyToOne(() => Event)
  event: Event;

  @Field(() => Member, { nullable: true })
  @ManyToOne(() => Member, { nullable: true })
  member: Member;

  @Field(() => Supporter, { nullable: true })
  @ManyToOne(() => Supporter, { nullable: true })
  supporter: Supporter;
}
