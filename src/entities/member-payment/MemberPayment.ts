import { IsUrl } from 'class-validator';
import { Field, Float, ObjectType } from 'type-graphql';
import { AfterCreate, Entity, ManyToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import cache from '@core/db/cache';
import { Community } from '@entities/entities';
import { QueryEvent } from '@util/events';
import MemberType from '../member-type/MemberType';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class MemberPayment extends BaseEntity {
  @Field(() => Float)
  @Property({ columnType: 'decimal' })
  amount: number;

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
      `${QueryEvent.GET_ACTIVE_DUES_GROWTH}-${this.community.id}`,
      `${QueryEvent.GET_DATABASE}-${this.community.id}`,
      `${QueryEvent.GET_PAYMENTS}-${this.community.id}`,
      `${QueryEvent.GET_PAYMENTS}-${this.member.id}`,
      `${QueryEvent.GET_TOTAL_DUES_COLLECTED}-${this.community.id}`,
      `${QueryEvent.GET_TOTAL_DUES_GROWTH}-${this.community.id}`,
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

  @Field(() => MemberType)
  @ManyToOne(() => MemberType)
  type: MemberType;
}
