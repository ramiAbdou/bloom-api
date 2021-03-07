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
import Community from '@entities/community/Community';
import Member from '@entities/member/Member';

export enum RecurrenceType {
  LIFETIME = 'Lifetime',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly'
}

@ObjectType()
@Entity()
export default class MemberPlan extends BaseEntity {
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

  @OneToMany(() => Member, (member) => member.plan)
  members = new Collection<Member>(this);
}
