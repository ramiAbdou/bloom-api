import { IsUrl } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
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

  @Property({ unique: true })
  @IsUrl()
  stripeInvoicePdf: string;

  @ManyToOne(() => Member)
  member: Member;

  @ManyToOne(() => MemberType, { nullable: true })
  type: MemberType;
}
