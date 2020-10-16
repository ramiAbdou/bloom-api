/**
 * @fileoverview Entity: MembershipQuestion
 * @author Rami Abdou
 */

import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property
} from 'mikro-orm';
import { Field, Int, ObjectType } from 'type-graphql';

import { Community } from '@entities';
import BaseEntity from '@util/db/BaseEntity';
import { QuestionCategory, QuestionType } from '@util/gql';
import MembershipQuestionOption from '../membership-question-option/MembershipQuestionOption';

@ObjectType()
@Entity()
export default class MembershipQuestion extends BaseEntity {
  // If the question is a special question, we have to store it in a different
  // fashion. For example, 'EMAIL' would be stored on the user, NOT the
  // membership.
  @Field(() => String)
  @Enum({
    items: ['EMAIL', 'FIRST_NAME', 'GENDER', 'LAST_NAME', 'MEMBERSHIP_TYPE'],
    nullable: true,
    type: String
  })
  category: QuestionCategory;

  @Field()
  @Property({ nullable: true, type: 'text' })
  description: string;

  // If set to false, this question will not appear in the community's
  // membership application form.
  @Field(() => Boolean)
  @Property({ type: Boolean })
  inApplication = true;

  // Order that the question appears. Similar to an index in an array.
  @Field(() => Int)
  @Property()
  order: number;

  @Field(() => Boolean)
  @Property({ type: Boolean })
  required = true;

  @Field()
  @Property()
  title: string;

  @Field(() => String)
  @Enum({
    items: ['SHORT_TEXT', 'LONG_TEXT', 'MULTIPLE_CHOICE', 'DROPDOWN_MULTIPLE'],
    type: String
  })
  type: QuestionType;

  /* 
  ___     _      _   _             _    _         
 | _ \___| |__ _| |_(_)___ _ _  __| |_ (_)_ __ ___
 |   / -_) / _` |  _| / _ \ ' \(_-< ' \| | '_ (_-<
 |_|_\___|_\__,_|\__|_\___/_||_/__/_||_|_| .__/__/
                                         |_|      
  */

  @ManyToOne(() => Community)
  community: Community;

  @OneToMany(() => MembershipQuestionOption, ({ question }) => question)
  options = new Collection<MembershipQuestionOption>(this);
}
