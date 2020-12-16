import { ObjectType } from 'type-graphql';
import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class MemberPayment extends BaseEntity {
  @Property()
  amount: number;

  @ManyToOne(() => Member)
  member: Member;
}
