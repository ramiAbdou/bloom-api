import { Authorized, Field, Int, ObjectType } from 'type-graphql';
import {
  ArrayType,
  BeforeCreate,
  Entity,
  Enum,
  ManyToOne,
  Property
} from '@mikro-orm/core';

import BaseEntity from '@core/db/BaseEntity';
import { Community } from '@entities/entities';
import { QuestionCategory, QuestionType } from './Question.types';

@ObjectType()
@Entity()
export default class Question extends BaseEntity {
  @Field(() => Number)
  @Property({ version: true })
  version!: number;

  // If the question is a special question, we have to store it in a different
  // fashion. For example, 'EMAIL' would be stored on the user, NOT the
  // member.
  @Field(() => String, { nullable: true })
  @Enum({ items: () => QuestionCategory, nullable: true, type: String })
  category: QuestionCategory;

  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  description: string;

  // If set to false, this question will not appear in the community's
  // member application form.
  @Field(() => Boolean)
  @Property({ type: Boolean })
  inApplication = true;

  // True if this is only needed for the application decision.
  @Field(() => Boolean)
  @Property({ type: Boolean })
  onlyInApplication = false;

  // In the applicant card if it's important to the ADMIN.
  @Authorized('ADMIN')
  @Field(() => Boolean)
  @Property({ type: Boolean })
  inApplicantCard = false;

  @Field(() => Boolean)
  @Property({ type: Boolean })
  inDirectoryCard = false;

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
  @Enum({ items: () => QuestionType, nullable: true, type: String })
  type: QuestionType;

  @BeforeCreate()
  beforeCreate() {
    if (['EMAIL', 'FIRST_NAME', 'LAST_NAME'].includes(this.category)) {
      this.type = QuestionType.SHORT_TEXT;
    }

    if (['FIRST_NAME', 'LAST_NAME'].includes(this.category)) {
      this.inDirectoryCard = false;
    }

    if (this.category === QuestionCategory.JOINED_AT) {
      this.inApplication = false;
    }

    if (this.category === 'GENDER') {
      this.type = QuestionType.MULTIPLE_CHOICE;
      this.options = ['Male', 'Female', 'Non-Binary', 'Prefer Not to Say'];
    }

    if (this.category === QuestionCategory.DUES_STATUS) {
      this.inApplication = false;
      this.inExpandedDirectoryCard = false;
      this.type = QuestionType.MULTIPLE_CHOICE;
    }

    if (this.category === QuestionCategory.MEMBERSHIP_TYPE) {
      this.inApplication = false;
      this.inApplicantCard = false;
      this.inExpandedDirectoryCard = false;
      this.options = this.community.types.getItems().map(({ name }) => name);
      this.type = QuestionType.MULTIPLE_CHOICE;
    }

    // By default, if the question is fit to be in the directory card, it is
    // fit to be in the expanded card as well.
    if (this.inDirectoryCard) this.inExpandedDirectoryCard = true;
  }

  // ## RELATIONSHIPS

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;
}
