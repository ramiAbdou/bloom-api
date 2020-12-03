/**
 * @fileoverview Entity: MembershipQuestion
 * @author Rami Abdou
 */

import { Authorized, Field, Int, ObjectType } from 'type-graphql';
import {
  ArrayType,
  BeforeCreate,
  Entity,
  EntityRepositoryType,
  Enum,
  ManyToOne,
  Property
} from '@mikro-orm/core';

import { Community } from '@entities';
import BaseEntity from '@util/db/BaseEntity';
import { QuestionCategory, QuestionType } from '@util/gql';
import MembershipQuestionRepo from './MembershipQuestion.repo';

@ObjectType()
@Entity({ customRepository: () => MembershipQuestionRepo })
export default class MembershipQuestion extends BaseEntity {
  [EntityRepositoryType]?: MembershipQuestionRepo;

  @Field(() => Number)
  @Property({ version: true })
  version!: number;

  // If the question is a special question, we have to store it in a different
  // fashion. For example, 'EMAIL' would be stored on the user, NOT the
  // membership.
  @Field(() => String, { nullable: true })
  @Enum({
    items: [
      'EMAIL',
      'FIRST_NAME',
      'GENDER',
      'JOINED_ON',
      'LAST_NAME',
      'MEMBERSHIP_TYPE'
    ],
    nullable: true,
    type: String
  })
  category: QuestionCategory;

  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  description: string;

  // If set to false, this question will not appear in the community's
  // membership application form.
  @Field(() => Boolean)
  @Property({ type: Boolean })
  inApplication = true;

  // In the applicant card if it's important to the ADMIN.
  @Authorized('ADMIN')
  @Field(() => Boolean)
  @Property({ type: Boolean })
  inApplicantCard = false;

  @Authorized('ADMIN')
  @Field(() => Boolean)
  @Property({ type: Boolean })
  inDirectoryCard = false;

  // Will only be non-null if the type is MULTIPLE_CHOICE or MULTIPLE_SELECT.
  @Field(() => [String], { nullable: true })
  @Property({ nullable: true, type: ArrayType })
  options: string[];

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

  @Field(() => String, { nullable: true })
  @Enum({
    items: ['SHORT_TEXT', 'LONG_TEXT', 'MULTIPLE_CHOICE', 'MULTIPLE_SELECT'],
    nullable: true,
    type: String
  })
  type: QuestionType;

  @BeforeCreate()
  beforeCreate() {
    if (['EMAIL', 'FIRST_NAME', 'LAST_NAME'].includes(this.category))
      this.type = 'SHORT_TEXT';
    else if (this.category === 'GENDER') {
      this.type = 'MULTIPLE_CHOICE';
      this.options = ['Male', 'Female', 'Non-Binary', 'Prefer Not to Say'];
    } else if (this.category === 'MEMBERSHIP_TYPE') {
      this.type = 'MULTIPLE_CHOICE';
      this.options = this.community.types.getItems().map(({ name }) => name);
    }

    if (this.category === 'MEMBERSHIP_TYPE') this.inApplicantCard = true;
  }

  // ## RELATIONSHIPS

  @ManyToOne(() => Community)
  community: Community;
}
