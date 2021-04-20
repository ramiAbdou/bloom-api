import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne, Unique } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Supporter from '@entities/supporter/Supporter';
import Event from '../event/Event';
import Member from '../member/Member';

@ObjectType()
@Entity()
@Unique({ properties: ['event', 'member', 'supporter'] })
export default class EventGuest extends BaseEntity {
  // ## RELATIONSHIPS

  @Field(() => Event)
  @ManyToOne(() => Event, { nullable: true })
  event: Event;

  @Field(() => Member, { nullable: true })
  @ManyToOne(() => Member, { nullable: true })
  member: Member;

  @Field(() => Supporter, { nullable: true })
  @ManyToOne(() => Supporter, { nullable: true })
  supporter: Supporter;
}
