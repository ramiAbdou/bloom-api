import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Member from '../member/Member';
import Question from '../question/Question';

@ObjectType()
@Entity()
export default class MemberValue extends BaseEntity {
  // ## FIELDS

  // We keep this loosely defined as a string to give flexibility. For
  // MULTIPLE_SELECT, if there are multiple values, they will be separated
  // by commas.
  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  value: string;

  // ## RELATIONSHIPS

  @Field(() => Member)
  @ManyToOne(() => Member)
  member: Member;

  @Field(() => Question)
  @ManyToOne(() => Question)
  question: Question;
}
