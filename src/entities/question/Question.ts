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

import BaseEntity from '@core/db/BaseEntity';
import { Community } from '@entities';
import { QuestionCategory, QuestionType } from './Question.args';
import QuestionRepo from './Question.repo';

@ObjectType()
@Entity({ customRepository: () => QuestionRepo })
export default class Question extends BaseEntity {
  [EntityRepositoryType]?: QuestionRepo;

  @Field(() => Number)
  @Property({ version: true })
  version!: number;

  // If the question is a special question, we have to store it in a different
  // fashion. For example, 'EMAIL' would be stored on the user, NOT the
  // member.
  @Field(() => String, { nullable: true })
  @Enum({
    items: [
      'CURRENT_LOCATION',
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
  // member application form.
  @Field(() => Boolean)
  @Property({ type: Boolean })
  inApplication = true;

  // In the applicant card if it's important to the ADMIN.
  @Authorized('ADMIN')
  @Field(() => Boolean)
  @Property({ type: Boolean })
  inApplicantCard = false;

  @Authorized()
  @Field(() => Boolean)
  @Property({ type: Boolean })
  inDirectoryCard = false;

  @Authorized()
  @Field(() => Boolean)
  @Property({ type: Boolean })
  inExpandedDirectoryCard = false;

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
    if (['EMAIL', 'FIRST_NAME', 'LAST_NAME'].includes(this.category)) {
      this.type = 'SHORT_TEXT';
    }

    if (['FIRST_NAME', 'LAST_NAME'].includes(this.category)) {
      this.inDirectoryCard = false;
    }

    if (this.category === 'GENDER') {
      this.type = 'MULTIPLE_CHOICE';
      this.options = ['Male', 'Female', 'Non-Binary', 'Prefer Not to Say'];
    }

    if (this.category === 'MEMBERSHIP_TYPE') {
      this.type = 'MULTIPLE_CHOICE';
      this.options = this.community.types.getItems().map(({ name }) => name);
    }

    if (this.category === 'MEMBERSHIP_TYPE') this.inApplicantCard = true;

    // By default, if the question is fit to be in the directory card, it is
    // fit to be in the expanded card as well.
    if (this.inDirectoryCard) this.inExpandedDirectoryCard = true;
  }

  // ## RELATIONSHIPS

  @ManyToOne(() => Community)
  community: Community;
}
