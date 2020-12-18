import { ObjectType } from 'type-graphql';
import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Member from '../member/Member';
import { MemberPaymentStatus } from './MemberPayment.types';

@ObjectType()
@Entity()
export default class MemberPayment extends BaseEntity {
  @Property()
  amount: number;

  @Property()
  idempotencyKey: string;

  @Property()
  stripePaymentIntentId: string;

  @Enum({ items: () => MemberPaymentStatus, type: String })
  status: MemberPaymentStatus = MemberPaymentStatus.PENDING;

  @ManyToOne(() => Member)
  member: Member;
}
