import { IsUrl } from 'class-validator';
import { Field, Float, ObjectType } from 'type-graphql';
import { AfterCreate, Entity, ManyToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import cache from '@core/db/cache';
import Community from '@entities/community/Community';
import { QueryEvent } from '@util/events';
import MemberPlan from '../member-plan/MemberPlan';
import Member from '../member/Member';

export enum PaymentType {
  DONATION = 'DONATION',
  DUES = 'DUES'
}

@ObjectType()
@Entity()
export default class Payment extends BaseEntity {
  @Field(() => Float)
  @Property({ columnType: 'decimal', serializer: (value) => Number(value) })
  amount: number;

  @Field(() => String)
  @Property()
  type: PaymentType;

  @Property({ unique: true })
  stripeInvoiceId: string;

  @Field()
  @Property({ unique: true })
  @IsUrl()
  stripeInvoiceUrl: string;

  // ## LIFECYCLE

  @AfterCreate()
  afterCreate() {
    cache.invalidateKeys([
      `${QueryEvent.GET_DATABASE}-${this.community.id}`,
      `${QueryEvent.GET_PAYMENTS}-${this.community.id}`,
      `${QueryEvent.GET_PAYMENTS}-${this.member.id}`,
      `${QueryEvent.GET_TOTAL_DUES_SERIES}-${this.community.id}`
    ]);
  }

  // ## RELATIONSHIPS

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;

  @Field(() => Member)
  @ManyToOne(() => Member)
  member: Member;

  @Field(() => MemberPlan)
  @ManyToOne(() => MemberPlan)
  plan: MemberPlan;
}
