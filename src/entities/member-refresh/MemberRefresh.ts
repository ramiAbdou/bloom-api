import { ObjectType } from 'type-graphql';
import { Entity, ManyToOne } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class MemberRefresh extends BaseEntity {
  @ManyToOne(() => Member)
  member: Member;
}
