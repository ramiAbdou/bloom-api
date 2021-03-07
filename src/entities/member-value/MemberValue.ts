import { Field, ObjectType } from 'type-graphql';
import {
  AfterCreate,
  AfterUpdate,
  Entity,
  ManyToOne,
  Property,
  wrap
} from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import { QueryEvent } from '@util/events';
import Member from '../member/Member';
import Question from '../question/Question';

@ObjectType()
@Entity()
export default class MemberValue extends BaseEntity {
  static cache = new Cache();

  // ## FIELDS

  // We keep this loosely defined as a string to give flexibility. For
  // MULTIPLE_SELECT, if there are multiple values, they will be separated
  // by commas.
  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  value: string;

  // ## LIFECYCLE HOOKS

  @AfterCreate()
  async afterCreate() {
    await wrap(this.member).init();

    MemberValue.cache.invalidateKeys([
      `${QueryEvent.GET_MEMBER_VALUES}-${this.member.id}`,
      `${QueryEvent.GET_MEMBER_VALUES}-${this.member.community.id}`
    ]);
  }

  @AfterUpdate()
  async afterUpdate() {
    await wrap(this.member).init();

    MemberValue.cache.invalidateKeys([
      `${QueryEvent.GET_MEMBER_VALUES}-${this.member.id}`,
      `${QueryEvent.GET_MEMBER_VALUES}-${this.member.community.id}`
    ]);
  }

  // ## RELATIONSHIPS

  @Field(() => Member)
  @ManyToOne(() => Member)
  member: Member;

  @Field(() => Question)
  @ManyToOne(() => Question)
  question: Question;
}
