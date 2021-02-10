import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { Community } from '@entities/entities';
import MemberType from '../member-type/MemberType';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class MemberPayment extends BaseEntity {
  @Field()
  @Property()
  amount: number;

  @Property({ unique: true })
  stripeInvoiceId: string;

  @Field()
  @Property({ unique: true })
  @IsUrl()
  stripeInvoiceUrl: string;

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
