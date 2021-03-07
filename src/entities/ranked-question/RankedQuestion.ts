import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne, OneToOne, Property } from '@mikro-orm/core';

import Cache from '@core/cache/cache';
import BaseEntity from '@core/db/BaseEntity';
import Application from '@entities/application/Application';
import Question from '@entities/question/Question';

@ObjectType()
@Entity()
export default class RankedQuestion extends BaseEntity {
  static cache = new Cache();

  // ## FIELDS

  @Field({ nullable: true })
  @Property({ nullable: true })
  rank: number = 0;

  // ## RELATIONSHIPS

  @Field(() => Application, { nullable: true })
  @ManyToOne(() => Application, { nullable: true })
  application?: Application;

  @Field(() => Question)
  @OneToOne()
  question: Question;
}
