import { Field, Float, ObjectType } from 'type-graphql';
import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { Community, Member } from '@entities/entities';
import { RecurrenceType } from './MemberType.types';

@ObjectType()
@Entity()
export default class MemberType extends BaseEntity {
  @Field(() => Float)
  @Property({ type: Number })
  amount = 0.0;

  @Field()
  @Property()
  name: string;

  @Field(() => String)
  @Enum({
    default: RecurrenceType.YEARLY,
    items: () => RecurrenceType,
    type: String
  })
  recurrence: RecurrenceType;

  @Field()
  @Property({ persist: false })
  get isFree(): boolean {
    return !this.amount;
  }

  @ManyToOne(() => Community)
  community: Community;

  @OneToMany(() => Member, ({ type }) => type)
  members = new Collection<Member>(this);
}
