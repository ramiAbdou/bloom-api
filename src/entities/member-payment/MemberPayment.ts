import { ObjectType } from 'type-graphql';
import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import MemberType from '../member-type/MemberType';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class MemberPayment extends BaseEntity {
  @Property()
  amount: number;

  @Property()
  stripeInvoiceId: string;

  @ManyToOne(() => Member)
  member: Member;

  @ManyToOne(() => MemberType, { nullable: true })
  type: MemberType;
}
