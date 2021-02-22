import { Field, ObjectType } from 'type-graphql';
import {
  AfterCreate,
  AfterUpdate,
  Entity,
  ManyToOne,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import cache from '@core/db/cache';
import { QueryEvent } from '@util/events';
import Member from '../member/Member';
import Question from '../question/Question';

@ObjectType()
@Entity()
export default class MemberData extends BaseEntity {
  // We keep this loosely defined as a string to give flexibility, especially
  // for multiple choice and multiple select values.
  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  value: string;

  // ## LIFECYCLE

  @AfterCreate()
  afterCreate() {
    cache.invalidateKeys([`${QueryEvent.GET_MEMBER_DATA}-${this.member.id}`]);
  }

  @AfterUpdate()
  afterUpdate() {
    cache.invalidateKeys([`${QueryEvent.GET_MEMBER_DATA}-${this.member.id}`]);
  }

  // ## RELATIONSHIPS

  @Field(() => Member)
  @ManyToOne(() => Member)
  member: Member;

  @Field(() => Question)
  @ManyToOne(() => Question)
  question: Question;
}
