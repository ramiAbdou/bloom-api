import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne, OneToOne, Property } from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import Application from '@entities/application/Application';
import Question from '@entities/question/Question';

@ObjectType()
@Entity()
export default class ApplicationQuestion extends BaseEntity {
  @Field({ nullable: true })
  @Property({ nullable: true })
  rank: number = 0;

  // ## RELATIONSHIPS

  @Field(() => Application)
  @ManyToOne()
  application: Application;

  @Field(() => Question)
  @OneToOne()
  question: Question;
}
