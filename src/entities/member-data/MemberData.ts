import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
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

  @ManyToOne(() => Member)
  member: Member;

  @Field(() => Question)
  @ManyToOne(() => Question)
  question: Question;
}
