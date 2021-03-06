import { ObjectType } from 'type-graphql';
import { Entity, ManyToOne } from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import Member from '../member/Member';

@ObjectType()
@Entity()
export default class MemberRefresh extends BaseEntity {
  static cache: Cache = new Cache();

  // ## RELATIONSHIPS

  @ManyToOne(() => Member)
  member: Member;
}
