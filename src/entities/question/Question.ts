import { Field, ObjectType } from 'type-graphql';
import {
  ArrayType,
  BeforeCreate,
  Entity,
  Enum,
  ManyToOne,
  Property
} from '@mikro-orm/core';

import Cache from '@core/cache/Cache';
import BaseEntity from '@core/db/BaseEntity';
import Community from '@entities/community/Community';

export enum QuestionCategory {
  BIO = 'BIO',
  DUES_STATUS = 'DUES_STATUS',
  EMAIL = 'EMAIL',
  EVENTS_ATTENDED = 'EVENTS_ATTENDED',
  FACEBOOK_URL = 'FACEBOOK_URL',
  FIRST_NAME = 'FIRST_NAME',
  GENDER = 'GENDER',
  INSTAGRAM_URL = 'INSTAGRAM_URL',
  JOINED_AT = 'JOINED_AT',
  LAST_NAME = 'LAST_NAME',
  LINKED_IN_URL = 'LINKED_IN_URL',
  MEMBER_TYPE = 'MEMBER_TYPE',
  TWITTER_URL = 'TWITTER_URL'
}

export enum QuestionType {
  LONG_TEXT = 'LONG_TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
  SHORT_TEXT = 'SHORT_TEXT'
}

@ObjectType()
@Entity()
export default class Question extends BaseEntity {
  static cache: Cache = new Cache();

  // ## FIELDS

  // If the question is a special question, we store it with a category. These
  // are questions that are typically seen in many communities.
  @Field(() => String, { nullable: true })
  @Enum({ items: () => QuestionCategory, nullable: true, type: String })
  category?: QuestionCategory;

  @Field({ nullable: true })
  @Property({ nullable: true, type: 'text' })
  description?: string;

  // True if the Question should never be modified by anybody. Essentially,
  // these are "system-generated" Question(s).
  @Field({ defaultValue: false })
  @Property()
  locked: boolean = false;

  // Will only be non-null if the type is MULTIPLE_CHOICE or MULTIPLE_SELECT.
  // TODO: Should we make this a separate entity?
  @Field(() => [String], { nullable: true })
  @Property({ nullable: true, type: ArrayType })
  options?: string[];

  // General order of the Question when rendered on front-end.
  @Field({ nullable: true })
  @Property({ nullable: true })
  rank?: number;

  // True if the Question is required for Member(s) to answer.
  @Field()
  @Property()
  required: boolean = true;

  @Field()
  @Property()
  title: string;

  @Field(() => String, { nullable: true })
  @Enum({ items: () => QuestionType, nullable: true, type: String })
  type: QuestionType;

  // ## LIFECYCLE HOOKS

  @BeforeCreate()
  beforeCreate(): void {
    if (this.category === QuestionCategory.BIO) {
      if (!this.title) this.title = 'Bio';
      this.type = QuestionType.LONG_TEXT;
    }

    if (this.category === QuestionCategory.DUES_STATUS) {
      if (!this.title) this.title = 'Dues Status';
      this.locked = true;
      this.type = QuestionType.MULTIPLE_CHOICE;
    }

    if (this.category === QuestionCategory.EMAIL) {
      if (!this.title) this.title = 'Email';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.EVENTS_ATTENDED) {
      if (!this.title) this.title = '# of Events Attended';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.FACEBOOK_URL) {
      if (!this.title) this.title = 'Facebook URL';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.FIRST_NAME) {
      if (!this.title) this.title = 'First Name';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.GENDER) {
      if (!this.title) this.title = 'Gender';
      this.options = ['Male', 'Female', 'Non-Binary', 'Prefer Not to Say'];
      this.type = QuestionType.MULTIPLE_CHOICE;
    }

    if (this.category === QuestionCategory.INSTAGRAM_URL) {
      if (!this.title) this.title = 'Instagram URL';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.JOINED_AT) {
      if (!this.title) this.title = 'Joined At';
      this.locked = true;
    }

    if (this.category === QuestionCategory.LAST_NAME) {
      if (!this.title) this.title = 'Last Name';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.LINKED_IN_URL) {
      if (!this.title) this.title = 'LinkedIn URL';
      this.type = QuestionType.SHORT_TEXT;
    }

    if (this.category === QuestionCategory.MEMBER_TYPE) {
      if (!this.title) this.title = 'Member Type';
      this.locked = true;
      this.type = QuestionType.MULTIPLE_CHOICE;
    }

    if (this.category === QuestionCategory.TWITTER_URL) {
      if (!this.title) this.title = 'Twitter URL';
      this.type = QuestionType.SHORT_TEXT;
    }
  }

  // ## RELATIONSHIPS

  @Field(() => Community)
  @ManyToOne(() => Community)
  community: Community;
}
