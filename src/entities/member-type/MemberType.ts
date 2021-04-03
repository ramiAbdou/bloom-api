import { Field, Float, ObjectType } from 'type-graphql';
import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property
} from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';

export enum RecurrenceType {
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly'
}

@ObjectType()
@Entity()
export default class MemberType extends BaseEntity {
  static cache: Cache = new Cache();

  // ## FIELDS

  @Field(() => Float)
  @Property({ columnType: 'decimal', type: Number })
  amount = 0.0;

  @Field()
  @Property()
  name: string;

  @Field(() => String)
  @Enum({ items: () => RecurrenceType, type: String })
  recurrence: RecurrenceType = RecurrenceType.YEARLY;

  @Property({ nullable: true })
  stripePriceId: string;

  @Property({ nullable: true })
  stripeProductId: string;

  @Field()
  @Property({ persist: false })
  get isFree(): boolean {
    return !this.amount;
  }

  // ## RELATIONSHIPS

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;

  @OneToMany(() => Member, (member: Member) => member.memberType)
  members = new Collection<Member>(this);
}
